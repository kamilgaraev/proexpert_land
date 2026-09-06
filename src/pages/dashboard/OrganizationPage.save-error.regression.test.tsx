import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OrganizationPage from "./OrganizationPage";

const apiMocks = vi.hoisted(() => ({
  getCurrent: vi.fn(),
  update: vi.fn(),
  requestVerification: vi.fn(),
}));

vi.mock("@utils/api", () => ({
  organizationService: {
    getCurrent: apiMocks.getCurrent,
    update: apiMocks.update,
    requestVerification: apiMocks.requestVerification,
  },
}));

vi.mock("@hooks/useDaData", () => ({
  useDaData: () => ({
    searchAddresses: vi.fn(),
  }),
}));

vi.mock("@components/dashboard/VerificationRecommendations", () => ({
  default: () => null,
}));

vi.mock("@pages/dashboard/organization", () => ({
  OrganizationSettingsPage: () => null,
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const organizationResponse = {
  success: true,
  data: {
    organization: {
      id: 38,
      name: "МТ91-213",
      legal_name: "МТ91-213",
      tax_number: "6658522310",
      registration_number: "1196658003277",
      okpo: null,
      phone: "+79872198986",
      email: "owner@example.test",
      address: "г. Казань, ул. Тестовая, д. 1",
      city: "Казань",
      postal_code: "420021",
      country: "Россия",
      description: "",
      is_verified: true,
      verification_score: 100,
      verification_status: "verified",
    },
    recommendations: {
      status: "verified",
      status_text: "Полностью верифицирована",
      current_score: 100,
      max_score: 100,
      recommendations: [],
    },
    user_message: null,
  },
};

describe("OrganizationPage save errors", () => {
  beforeEach(() => {
    apiMocks.getCurrent.mockReset();
    apiMocks.update.mockReset();
    apiMocks.requestVerification.mockReset();
    apiMocks.getCurrent.mockResolvedValue(organizationResponse);
  });

  it("keeps edits after a network failure and retries without duplicate pending requests", async () => {
    let rejectRequest!: (reason: Error) => void;
    apiMocks.update.mockImplementationOnce(() => new Promise((_, reject) => { rejectRequest = reject; }));
    render(<MemoryRouter><OrganizationPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /Редактировать/ }));
    fireEvent.change(screen.getByLabelText("Название организации"), { target: { value: "Новое название" } });
    const form = screen.getByRole("button", { name: "Сохранить" }).closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(apiMocks.update).toHaveBeenCalledTimes(1);
    rejectRequest(new Error("offline"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Не удалось сохранить изменения");
    expect(screen.getByLabelText("Название организации")).toHaveValue("Новое название");
    apiMocks.update.mockRejectedValueOnce({ response: { data: { message: "Проверьте название организации" } } });
    fireEvent.submit(form);
    expect(await screen.findByText("Проверьте название организации")).toBeInTheDocument();
    expect(apiMocks.update).toHaveBeenCalledTimes(2);
    expect(apiMocks.update).toHaveBeenLastCalledWith(expect.objectContaining({ name: "Новое название" }));
    expect(screen.getByLabelText("Название организации")).toHaveValue("Новое название");
  });

  it("shows an unsuccessful response without discarding the form", async () => {
    apiMocks.update.mockResolvedValue({ success: false, message: "Изменения не приняты" });
    render(<MemoryRouter><OrganizationPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /Редактировать/ }));
    fireEvent.change(screen.getByLabelText("Телефон"), { target: { value: "+79000000000" } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Не удалось сохранить изменения");
    expect(screen.getByLabelText("Телефон")).toHaveValue("+79000000000");
  });

  it("restores saved contacts after discarding an edit", async () => {
    render(<MemoryRouter><OrganizationPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /Редактировать/ }));
    expect(screen.getByLabelText("Название организации")).toHaveFocus();
    expect(screen.getByLabelText("Телефон")).toHaveValue(organizationResponse.data.organization.phone);
    expect(screen.getByLabelText("Email")).toHaveValue(organizationResponse.data.organization.email);
    fireEvent.change(screen.getByLabelText("Телефон"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Отменить" }));
    expect(screen.getByRole("button", { name: /Редактировать/ })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: /Редактировать/ }));
    expect(screen.getByLabelText("Название организации")).toHaveFocus();
    expect(screen.getByLabelText("Телефон")).toHaveValue(organizationResponse.data.organization.phone);
    expect(screen.getByLabelText("Email")).toHaveValue(organizationResponse.data.organization.email);
    expect(apiMocks.update).not.toHaveBeenCalled();
  });

  it("keeps the server validation message visible inside the form", async () => {
    apiMocks.update.mockRejectedValue({
      response: {
        data: {
          message: "Организация с таким email уже существует.",
          errors: {
            email: ["Организация с таким email уже существует."],
          },
        },
      },
    });

    render(
      <MemoryRouter>
        <OrganizationPage />
      </MemoryRouter>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /Редактировать/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Организация с таким email уже существует.",
    );
  });

  it("keeps the organization visible when update returns no recommendations", async () => {
    const updatedResponse = {
      ...organizationResponse,
      data: {
        ...organizationResponse.data,
        organization: {
          ...organizationResponse.data.organization,
          okpo: "12345678",
        },
      },
    };

    apiMocks.getCurrent
      .mockResolvedValueOnce(organizationResponse)
      .mockResolvedValueOnce(updatedResponse);
    apiMocks.update.mockResolvedValue({
      success: true,
      data: {
        organization: updatedResponse.data.organization,
      },
    });

    render(
      <MemoryRouter>
        <OrganizationPage />
      </MemoryRouter>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /Редактировать/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(await screen.findByText("12345678")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Редактировать/ })).toHaveFocus();
    expect(screen.queryByText("Данные организации не найдены")).toBeNull();
  });
});
