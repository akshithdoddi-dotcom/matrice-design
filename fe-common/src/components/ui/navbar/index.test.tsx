import { vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

import {
  Navbar,
  NavbarActionButton,
  NavbarActionStatus,
  NavbarDropdownButton,
  NavbarNotificationButton,
} from "./index";

describe("Navbar", () => {
  it("renders without crashing", () => {
    render(<Navbar />);
  });

  it("renders the sidebar toggle button with correct aria-label when open", () => {
    render(<Navbar isSidebarOpen={true} onToggleSidebar={() => {}} />);
    expect(
      screen.getByRole("button", { name: /collapse sidebar/i }),
    ).toBeInTheDocument();
  });

  it("renders the sidebar toggle button with correct aria-label when closed", () => {
    render(<Navbar isSidebarOpen={false} onToggleSidebar={() => {}} />);
    expect(
      screen.getByRole("button", { name: /expand sidebar/i }),
    ).toBeInTheDocument();
  });

  it("calls onToggleSidebar when the sidebar toggle is clicked", () => {
    const handler = vi.fn();
    render(<Navbar onToggleSidebar={handler} isSidebarOpen={true} />);
    fireEvent.click(screen.getByRole("button", { name: /collapse sidebar/i }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("renders breadcrumbRoot text", () => {
    render(<Navbar breadcrumbRoot="Projects" />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders breadcrumb dropdowns with correct initial value", () => {
    const options = [
      { value: "a", label: "Option A" },
      { value: "b", label: "Option B" },
    ];
    render(<Navbar breadcrumbDropdowns={[{ value: "a", options }]} />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
  });

  it("renders the action button when actionStatus and onActionClick are provided", () => {
    const handler = vi.fn();
    render(
      <Navbar
        actionStatus={NavbarActionStatus.Resume}
        onActionClick={handler}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /start/i }));
    expect(handler).toHaveBeenCalledWith(NavbarActionStatus.Resume);
  });

  it("renders the stop button when status is Running", () => {
    const handler = vi.fn();
    render(
      <Navbar
        actionStatus={NavbarActionStatus.Running}
        onActionClick={handler}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /stop/i }));
    expect(handler).toHaveBeenCalledWith(NavbarActionStatus.Running);
  });

  it("does not render action button when actionStatus is not provided", () => {
    render(<Navbar />);
    expect(
      screen.queryByRole("button", { name: /start/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /stop/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the search widget when onSearch is provided", () => {
    render(<Navbar onSearch={() => {}} />);
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("does not render the search widget when onSearch is not provided", () => {
    render(<Navbar />);
    expect(
      screen.queryByRole("button", { name: /search \(⌘k\)/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the avatar when provided", () => {
    render(<Navbar avatar={<img src="avatar.png" alt="User avatar" />} />);
    expect(screen.getByAltText("User avatar")).toBeInTheDocument();
  });
});

describe("NavbarDropdownButton", () => {
  const options = [
    { value: "opt-1", label: "Option 1" },
    { value: "opt-2", label: "Option 2" },
  ];

  it("renders the currently selected label", () => {
    render(<NavbarDropdownButton value="opt-1" options={options} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("opens the option list on click", () => {
    render(<NavbarDropdownButton value="opt-1" options={options} />);
    fireEvent.click(screen.getByRole("button", { name: /option 1/i }));
    expect(screen.getAllByText(/Option 1|Option 2/).length).toBeGreaterThan(0);
  });

  it("calls onChange when an option is selected", () => {
    const handler = vi.fn();
    render(
      <NavbarDropdownButton
        value="opt-1"
        options={options}
        onChange={handler}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /option 1/i }));
    fireEvent.click(screen.getByRole("option", { name: /option 2/i }));
    expect(handler).toHaveBeenCalledWith("opt-2");
  });
});

describe("NavbarActionButton", () => {
  it("renders start button for Resume status", () => {
    render(<NavbarActionButton status={NavbarActionStatus.Resume} />);
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });

  it("renders stop button for Running status", () => {
    render(<NavbarActionButton status={NavbarActionStatus.Running} />);
    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
  });

  it("renders inactive stop button for Stopped status", () => {
    const { container } = render(
      <NavbarActionButton status={NavbarActionStatus.Stopped} />,
    );
    const button = container.querySelector("button");
    expect(button?.className).toContain("opacity-50");
  });

  it("passes current status to onClick callback", () => {
    const handler = vi.fn();
    render(
      <NavbarActionButton
        status={NavbarActionStatus.Running}
        onClick={handler}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /stop/i }));
    expect(handler).toHaveBeenCalledWith(NavbarActionStatus.Running);
  });
});

describe("NavbarNotificationButton", () => {
  it("renders with aria-label Notifications", () => {
    render(<NavbarNotificationButton />);
    expect(
      screen.getByRole("button", { name: /notifications/i }),
    ).toBeInTheDocument();
  });
});
