import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  it,
  vi,
} from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { customRolesService } from "@/utils/api";
import { clearAuthToken, saveAuthToken } from "@/utils/authTokenStorage";
import UserCreateInviteModal from "./UserCreateInviteModal";

const api = vi.hoisted(() => ({
  fetchRoles: vi.fn(),
  sendInvitation: vi.fn(),
  createUserWithCustomRoles: vi.fn(),
}));
vi.mock("@/hooks/useUserManagement", () => ({
  useUserManagement: () => ({
    roles: [{ slug: "accountant", name: "Бухгалтер", is_system: true }],
    ...api,
  }),
}));

const url = "https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing/user-management";
const server = setupServer();
let requests = { available: 0, custom: 0, permissions: 0 };
let customFailure = false;
let customRoleName = "Прораб";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => {
  cleanup();
  server.resetHandlers();
  clearAuthToken();
});
beforeEach(() => {
  vi.resetAllMocks();
  requests = { available: 0, custom: 0, permissions: 0 };
  customFailure = false;
  customRoleName = "Прораб";
  saveAuthToken("role-modal-test-token");
  api.fetchRoles.mockImplementation(() =>
    customRolesService.getAvailableRoles(),
  );
  server.use(
    http.get(`${url}/available-roles`, () => {
      requests.available++;
      return HttpResponse.json({
        success: true,
        data: { organization_id: 7, system_roles: [], custom_roles: [] },
      });
    }),
    http.get(`${url}/custom-roles`, () => {
      requests.custom++;
      return customFailure
        ? HttpResponse.json({ message: "Unavailable" }, { status: 503 })
        : HttpResponse.json({
            success: true,
            data: [{ id: 41, slug: "site-supervisor", name: customRoleName }],
          });
    }),
    http.get(`${url}/custom-roles/permissions/available`, () => {
      requests.permissions++;
      return HttpResponse.json({
        system_permissions: [],
        module_permissions: {},
      });
    }),
  );
});

it("загружает только нужные роли один раз при открытии и свежие роли при повторном открытии", async () => {
  const props = { onClose: vi.fn(), onSave: vi.fn() };
  const customFetch = vi.spyOn(customRolesService, "getCustomRoles");
  const availableFetch = vi.spyOn(customRolesService, "getAvailableRoles");
  const permissionsFetch = vi.spyOn(
    customRolesService,
    "getCustomRolePermissions",
  );
  const { rerender } = render(
    <UserCreateInviteModal {...props} isOpen={false} />,
  );
  expect(customFetch).not.toHaveBeenCalled();
  expect(availableFetch).not.toHaveBeenCalled();
  expect(permissionsFetch).not.toHaveBeenCalled();
  expect(api.fetchRoles).not.toHaveBeenCalled();
  rerender(<UserCreateInviteModal {...props} isOpen />);
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Отправить" })).toBeEnabled(),
  );
  expect(screen.getByRole("checkbox", { name: "Прораб" })).toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: "Бухгалтер" }),
  ).toBeInTheDocument();
  expect(requests).toEqual({ available: 1, custom: 1, permissions: 0 });
  fireEvent.change(screen.getByLabelText("Имя *"), {
    target: { value: "Анна" },
  });
  expect(requests).toEqual({ available: 1, custom: 1, permissions: 0 });
  rerender(<UserCreateInviteModal {...props} isOpen={false} />);
  customRoleName = "Старший прораб";
  rerender(<UserCreateInviteModal {...props} isOpen />);
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Отправить" })).toBeEnabled(),
  );
  expect(requests).toEqual({ available: 2, custom: 2, permissions: 0 });
  expect(
    screen.getByRole("checkbox", { name: "Старший прораб" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("checkbox", { name: "Прораб" }),
  ).not.toBeInTheDocument();
  expect(api.sendInvitation).not.toHaveBeenCalled();
  expect(api.createUserWithCustomRoles).not.toHaveBeenCalled();
});

it("повторяет отказ реального HTTP-запроса без лишних каталогов и потери полей", async () => {
  customFailure = true;
  render(<UserCreateInviteModal isOpen onClose={vi.fn()} onSave={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Имя *"), {
    target: { value: "Анна" },
  });
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Не удалось загрузить роли",
  );
  expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
  expect(requests).toEqual({ available: 1, custom: 1, permissions: 0 });
  customFailure = false;
  fireEvent.click(
    screen.getByRole("button", { name: "Повторить загрузку ролей" }),
  );
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Отправить" })).toBeEnabled(),
  );
  expect(screen.getByRole("checkbox", { name: "Прораб" })).toBeInTheDocument();
  expect(screen.getByLabelText("Имя *")).toHaveValue("Анна");
  expect(requests).toEqual({ available: 2, custom: 2, permissions: 0 });
  expect(api.sendInvitation).not.toHaveBeenCalled();
});
