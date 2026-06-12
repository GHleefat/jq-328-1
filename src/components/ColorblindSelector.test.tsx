import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorblindSelector } from "./ColorblindSelector";
import type { ColorblindType } from "@/types";

describe("ColorblindSelector", () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: "normal" as ColorblindType,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("渲染", () => {
    it("应该正确渲染当前选中的选项", () => {
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button", { expanded: false });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("正常视觉");
    });

    it("应该显示正确的选项描述", () => {
      render(<ColorblindSelector {...defaultProps} />);

      expect(screen.getByText("显示原始图片，无颜色转换")).toBeInTheDocument();
    });

    it("disabled 状态下应该显示为禁用", () => {
      render(<ColorblindSelector {...defaultProps} disabled />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("展开/收起", () => {
    it("点击按钮应该展开下拉菜单", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button", { expanded: false });
      await user.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("再次点击按钮应该收起下拉菜单", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button", { expanded: false });
      await user.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      await user.click(button);
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("disabled 状态下点击按钮不应该展开菜单", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} disabled />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("选项选择", () => {
    it("点击选项应该调用 onChange 并传入正确的值", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button", { expanded: false });
      await user.click(button);

      const option = screen.getByRole("option", { name: /红色盲/ });
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith("protanopia");
    });

    it("选中选项后菜单应该关闭", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button", { expanded: false });
      await user.click(button);

      const option = screen.getByRole("option", { name: /绿色盲/ });
      await user.click(option);

      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("应该渲染所有色盲类型选项", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const options = screen.getAllByRole("option");
      expect(options.length).toBe(7);
    });

    it('当前选中的选项应该有 aria-selected="true"', async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} value="deuteranopia" />);

      const button = screen.getByRole("button");
      await user.click(button);

      const selectedOption = screen.getByRole("option", { selected: true });
      expect(selectedOption).toHaveTextContent("绿色盲");
    });
  });

  describe("点击外部关闭", () => {
    it("点击菜单外部区域应该关闭菜单", () => {
      render(
        <div>
          <div data-testid="outside-element">外部元素</div>
          <ColorblindSelector {...defaultProps} />
        </div>,
      );

      const button = screen.getByRole("button", { expanded: false });
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      const outside = screen.getByTestId("outside-element");
      fireEvent.mouseDown(outside);

      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("点击下拉菜单项不应该被视为外部点击", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button", { expanded: false });
      await user.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      const options = screen.getAllByRole("option");
      const firstOption = options[0];

      fireEvent.mouseDown(firstOption);

      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("点击按钮本身不应该被视为外部点击", () => {
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button", { expanded: false });
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      fireEvent.mouseDown(button);

      expect(button).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("键盘操作", () => {
    it("按 Enter 键应该切换菜单展开状态", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button", { expanded: false });
      button.focus();

      await user.keyboard("{Enter}");
      expect(button).toHaveAttribute("aria-expanded", "true");

      await user.keyboard("{Enter}");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("按 Space 键应该切换菜单展开状态", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button", { expanded: false });
      button.focus();

      await user.keyboard(" ");
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("按 Escape 键应该关闭菜单", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button", { expanded: false });
      await user.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      await user.keyboard("{Escape}");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("disabled 状态下键盘操作不应该起作用", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} disabled />);

      const button = screen.getByRole("button");
      button.focus();

      await user.keyboard("{Enter}");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Portal 渲染", () => {
    it("下拉菜单应该渲染到 document.body 中", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const listbox = document.querySelector('[role="listbox"]');
      expect(listbox).toBeInTheDocument();
      expect(listbox?.parentElement).toBe(document.body);
    });

    it("使用 Portal 的下拉菜单点击选项后能正常触发 onChange", async () => {
      const user = userEvent.setup();
      render(<ColorblindSelector {...defaultProps} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const option = screen.getByRole("option", { name: /蓝黄色盲/ });
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith("tritanopia");
    });
  });
});
