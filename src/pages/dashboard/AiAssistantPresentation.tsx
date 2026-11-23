import { Fragment, type ReactNode } from 'react';
import { aiAssistantRenderer } from '@/utils/aiAssistantRenderer';

type Value =
  | { kind: 'text' | 'date' | 'datetime'; value: string }
  | { kind: 'decimal'; value: string; currency?: string; unit?: string; vat?: 'included' | 'excluded' | 'unknown' }
  | { kind: 'boolean'; value: boolean };

type Label = { key: string; label: string };
type Field = Label & { value: Value };
type ListItem = { id: string; title: string; fields?: Field[]; details?: string; status?: string };
type TableRow = { id: string; cells: Record<string, Value>; details?: string };

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const text = (value: unknown): value is string => typeof value === 'string' && !!value.trim();

const optionalText = (value: unknown): value is string | undefined => value === undefined || text(value);

const collection = <T,>(value: unknown, limit: number, isItem: (item: unknown) => item is T): value is T[] =>
  Array.isArray(value) && value.length > 0 && value.length <= limit && value.every(isItem);

const decimal = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
const date = /^(\d{4})-(\d{2})-(\d{2})$/;
const dateTime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?)(Z|[+-]\d{2}:\d{2})$/;

function isValue(value: unknown): value is Value {
  if (!record(value)) return false;
  if (value.kind === 'boolean') return typeof value.value === 'boolean';
  if (!text(value.value)) return false;
  switch (value.kind) {
    case 'text':
      return true;
    case 'date':
      return date.test(value.value);
    case 'datetime':
      return dateTime.test(value.value);
    case 'decimal':
      return decimal.test(value.value) && optionalText(value.currency) && optionalText(value.unit)
        && (value.vat === undefined || value.vat === 'included' || value.vat === 'excluded' || value.vat === 'unknown');
    default:
      return false;
  }
}

const isLabel = (value: unknown): value is Label & Record<string, unknown> => record(value) && text(value.key) && text(value.label);
const isField = (value: unknown): value is Field => isLabel(value) && isValue(value.value);
const isListItem = (value: unknown): value is ListItem =>
  record(value) && text(value.id) && text(value.title) && optionalText(value.details) && optionalText(value.status)
  && (value.fields === undefined || collection(value.fields, 32, isField));

const vatLabels = { included: 'с НДС', excluded: 'без НДС', unknown: 'НДС не указан' } as const;

function FieldValue({ value }: { value: Value }) {
  switch (value.kind) {
    case 'boolean':
      return value.value ? 'Да' : 'Нет';
    case 'date':
    case 'datetime': {
      const [, year, month, day, time, offset] = (value.kind === 'date' ? date : dateTime).exec(value.value) ?? [];
      return <time dateTime={value.value}>{day}.{month}.{year}{time && `, ${time} (UTC${offset === 'Z' ? '+00:00' : offset})`}</time>;
    }
    case 'decimal':
      return <span className="tabular-nums">{[value.value.replace('.', ','), value.currency, value.unit, value.vat && vatLabels[value.vat]].filter(Boolean).join(' ')}</span>;
    case 'text':
      return value.value;
  }
}

function Fields({ items }: { items: Field[] }) {
  return <dl className="grid gap-2 sm:grid-cols-2">
    {items.map(({ key, label, value }) => <div key={key} className="min-w-0 rounded-md border bg-background px-3 py-2">
      <dt className="break-words text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium"><FieldValue value={value} /></dd>
    </div>)}
  </dl>;
}

function ResultList({ items }: { items: ListItem[] }) {
  return <ul role="list" className="space-y-2">
    {items.map(({ id, title, fields, details, status }) => <li key={id} className="space-y-2 rounded-md border bg-background px-3 py-2">
      <p className="break-words font-medium">{title}</p>
      {status && <p className="break-words text-xs text-muted-foreground">{status}</p>}
      {details && <p className="whitespace-pre-wrap break-words">{details}</p>}
      {fields && <Fields items={fields} />}
    </li>)}
  </ul>;
}

function ResultTable({ columns, rows }: { columns: Label[]; rows: TableRow[] }) {
  const showDetails = rows.some((row) => row.details);
  return <div role="region" aria-label="Таблица ответа" tabIndex={0} className="max-w-full overflow-x-auto rounded-md border bg-background">
    <table className="w-full border-collapse text-left text-sm">
      <thead className="bg-muted">
        <tr>
          {columns.map(({ key, label }) => <th key={key} scope="col" className="px-3 py-2 font-medium">{label}</th>)}
          {showDetails && <th scope="col" className="px-3 py-2 font-medium">Подробности</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map(({ id, cells, details }) => <tr key={id} className="border-t align-top">
          {columns.map(({ key }) => <td key={key} className="px-3 py-2"><FieldValue value={cells[key]} /></td>)}
          {showDetails && <td className="whitespace-pre-wrap px-3 py-2">{details}</td>}
        </tr>)}
      </tbody>
    </table>
  </div>;
}

type SupportedBlock = typeof aiAssistantRenderer.supported_blocks[number];

const renderBlock: Record<SupportedBlock, (data: Record<string, unknown>) => ReactNode> = {
  facts: (data) => collection(data.items, 32, isField) ? <Fields items={data.items} /> : null,
  list: (data) => collection(data.items, 200, isListItem) ? <ResultList items={data.items} /> : null,
  table: (data) => {
    if (!collection(data.columns, 32, isLabel)) return null;
    const columns = data.columns;
    const isRow = (row: unknown): row is TableRow => {
      if (!record(row) || !text(row.id) || !record(row.cells) || !optionalText(row.details)) return false;
      const cells = row.cells;
      return columns.every(({ key }) => Object.prototype.hasOwnProperty.call(cells, key) && isValue(cells[key]));
    };
    return collection(data.rows, 200, isRow) ? <ResultTable columns={columns} rows={data.rows} /> : null;
  },
};

function supportedBlock(value: unknown): value is SupportedBlock {
  return aiAssistantRenderer.supported_blocks.some((type) => type === value);
}

export default function AiAssistantPresentation({ presentation }: { presentation: unknown }) {
  if (!record(presentation) || presentation.version !== aiAssistantRenderer.renderer_version
    || !Array.isArray(presentation.blocks) || presentation.blocks.length > 32) return null;

  const ids = new Set<string>();
  const items = presentation.blocks.flatMap((block: unknown) => {
    if (!record(block) || !text(block.id) || ids.has(block.id) || !supportedBlock(block.type) || !record(block.data)) return [];
    const content = renderBlock[block.type](block.data);
    if (content === null) return [];
    ids.add(block.id);
    return [<Fragment key={block.id}>{content}</Fragment>];
  });

  return items.length > 0 ? <div className="my-3 min-w-0 space-y-2 text-sm">{items}</div> : null;
}
