import {
    PuzzlePieceIcon,
    CheckCircleIcon as _CheckCircleIcon,
    BuildingOfficeIcon,
    UsersIcon,
    ShareIcon,
    ChartBarIcon,
    ChartPieIcon,
    DocumentChartBarIcon,
    CpuChipIcon,
    ServerIcon,
    BeakerIcon,
    CloudIcon,
    CogIcon,
    ShieldCheckIcon,
    BanknotesIcon,
    CalendarIcon,
    ClockIcon,
    DocumentDuplicateIcon,
    GlobeAltIcon,
    KeyIcon,
    LockClosedIcon,
    MagnifyingGlassIcon,
    PaperAirplaneIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { Module } from '@utils/api';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    'building': BuildingOfficeIcon, 'building-office': BuildingOfficeIcon, 'office': BuildingOfficeIcon, 'organization': BuildingOfficeIcon, 'company': BuildingOfficeIcon,
    'users': UsersIcon, 'user': UsersIcon, 'people': UsersIcon, 'team': UsersIcon,
    'sitemap': ShareIcon, 'share': ShareIcon, 'network': ShareIcon, 'multi': ShareIcon, 'hierarchy': ShareIcon,
    'chart-bar': ChartBarIcon, 'chart': ChartBarIcon, 'bar': ChartBarIcon, 'analytics': ChartBarIcon, 'stats': ChartBarIcon,
    'chart-line': ChartPieIcon, 'chart-pie': ChartPieIcon, 'pie': ChartPieIcon, 'advanced': ChartPieIcon,
    'document-chart': DocumentChartBarIcon, 'document': DocumentChartBarIcon, 'report': DocumentChartBarIcon, 'reports': DocumentChartBarIcon,
    'cpu-chip': CpuChipIcon, 'cpu': CpuChipIcon, 'chip': CpuChipIcon, 'processing': CpuChipIcon,
    'server': ServerIcon, 'database': ServerIcon, 'storage': ServerIcon,
    'beaker': BeakerIcon, 'experiment': BeakerIcon, 'test': BeakerIcon, 'lab': BeakerIcon,
    'cloud': CloudIcon, 'api': CloudIcon, 'service': CloudIcon,
    'puzzle': PuzzlePieceIcon, 'puzzle-piece': PuzzlePieceIcon, 'module': PuzzlePieceIcon, 'addon': PuzzlePieceIcon, 'plugin': PuzzlePieceIcon,
    'cog': CogIcon, 'settings': CogIcon, 'config': CogIcon, 'configuration': CogIcon, 'gear': CogIcon,
    'shield': ShieldCheckIcon, 'shield-check': ShieldCheckIcon, 'security': ShieldCheckIcon, 'protection': ShieldCheckIcon, 'auth': ShieldCheckIcon, 'authentication': ShieldCheckIcon, 'permissions': ShieldCheckIcon,
    'banknotes': BanknotesIcon, 'money': BanknotesIcon, 'finance': BanknotesIcon, 'financial': BanknotesIcon, 'billing': BanknotesIcon, 'payment': BanknotesIcon, 'invoice': BanknotesIcon,
    'calendar': CalendarIcon, 'schedule': CalendarIcon, 'time': CalendarIcon, 'date': CalendarIcon, 'planning': CalendarIcon,
    'clock': ClockIcon, 'timer': ClockIcon, 'history': ClockIcon, 'tracking': ClockIcon, 'calendar-alt': CalendarIcon,
    'document-duplicate': DocumentDuplicateIcon, 'copy': DocumentDuplicateIcon, 'duplicate': DocumentDuplicateIcon, 'backup': DocumentDuplicateIcon, 'export': DocumentDuplicateIcon, 'import': DocumentDuplicateIcon,
    'globe': GlobeAltIcon, 'globe-alt': GlobeAltIcon, 'web': GlobeAltIcon, 'website': GlobeAltIcon, 'internet': GlobeAltIcon, 'integration': GlobeAltIcon, 'external': GlobeAltIcon, 'integrations': GlobeAltIcon,
    'key': KeyIcon, 'password': KeyIcon, 'access': KeyIcon, 'credential': KeyIcon, 'token': KeyIcon,
    'lock': LockClosedIcon, 'lock-closed': LockClosedIcon, 'locked': LockClosedIcon, 'private': LockClosedIcon, 'secure': LockClosedIcon, 'encrypted': LockClosedIcon,
    'magnifying-glass': MagnifyingGlassIcon, 'search': MagnifyingGlassIcon, 'find': MagnifyingGlassIcon, 'lookup': MagnifyingGlassIcon, 'filter': MagnifyingGlassIcon,
    'paper-airplane': PaperAirplaneIcon, 'send': PaperAirplaneIcon, 'message': PaperAirplaneIcon, 'notification': PaperAirplaneIcon, 'email': PaperAirplaneIcon, 'mail': PaperAirplaneIcon,
    'wrench-screwdriver': WrenchScrewdriverIcon, 'tools': WrenchScrewdriverIcon, 'maintenance': WrenchScrewdriverIcon, 'repair': WrenchScrewdriverIcon, 'fix': WrenchScrewdriverIcon, 'utility': WrenchScrewdriverIcon,
    'bot': CpuChipIcon, 'ai': CpuChipIcon, 'sparkles': CpuChipIcon, 'calculator': DocumentChartBarIcon,
    'file-check': DocumentChartBarIcon, 'credit-card': BanknotesIcon, 'clipboard': DocumentDuplicateIcon,
    'clipboard-document-list': DocumentDuplicateIcon, 'cube': ServerIcon, 'puzzle-piece-alt': PuzzlePieceIcon,
};

const CATEGORY_FALLBACKS: Record<string, React.ComponentType<{ className?: string }>> = {
    'core': BuildingOfficeIcon,
    'reports': ChartBarIcon,
    'analytics': ChartPieIcon,
    'addon': PuzzlePieceIcon,
    'premium': CpuChipIcon,
    'feature': BeakerIcon,
    'management': CogIcon,
    'workflow': ShareIcon,
    'finance': BanknotesIcon,
    'documents': DocumentChartBarIcon,
    'hr': UsersIcon,
    'planning': CalendarIcon,
    'storage': ServerIcon,
    'estimates': DocumentChartBarIcon,
    'ai': CpuChipIcon,
};

const findIcon = (term: string): React.ComponentType<{ className?: string }> | null => {
    const lower = term.toLowerCase();
    if (ICON_MAP[lower]) return ICON_MAP[lower];
    const partial = Object.keys(ICON_MAP).find(k => k.includes(lower) || lower.includes(k));
    return partial ? ICON_MAP[partial] : null;
};

export const getModuleIcon = (
    iconName: string | null | undefined,
    module?: Module,
): React.ComponentType<{ className?: string }> => {
    let Icon = iconName ? findIcon(iconName) : null;

    if (!Icon && module?.category) Icon = findIcon(module.category);
    if (!Icon && module?.type) Icon = findIcon(module.type);

    if (!Icon && module?.name) {
        for (const word of module.name.toLowerCase().split(/\s+/)) {
            Icon = findIcon(word);
            if (Icon) break;
        }
    }

    if (!Icon && module) {
        Icon = CATEGORY_FALLBACKS[module.category] ?? CATEGORY_FALLBACKS[module.type] ?? null;
    }

    return Icon ?? PuzzlePieceIcon;
};
