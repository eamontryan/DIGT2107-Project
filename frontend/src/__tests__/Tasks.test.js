import React from "react";
import axios from "axios";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Tasks from "../Tasks";

// Mock axios to prevent actual API calls during testing
jest.mock("axios", () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({})),
}));

describe("Task Manager Component", () => {
    test("adds a task successfully (TC-001)", async () => {
        axios.post.mockResolvedValueOnce({
            data: { id: 1, title: "Test Task", priority: "Low", dueDate: "", dueTime: "" },
        });

        render(<Tasks />);

        const input = screen.getByPlaceholderText("Task Title");
        const addButton = screen.getByText("Add Task");

        fireEvent.change(input, { target: { value: "Test Task" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("https://digt2107-project.onrender.com/tasks", {
                title: "Test Task",
                priority: "Low",
                dueDate: "",
                dueTime: "",
            });
        });

        await waitFor(() => {
            expect(screen.getByText(/Test Task/i)).toBeInTheDocument();
        });
    });

    test("deletes a task successfully (TC-002)", async () => {
        const mockTask = { id: 1, title: "Task to Delete", priority: "Low", dueDate: "" };

        axios.get.mockResolvedValueOnce({
            data: [mockTask],
        });

        axios.delete.mockResolvedValueOnce({});

        render(<Tasks />);

        await waitFor(() => expect(screen.getByText(/Task to Delete/i)).toBeInTheDocument());

        const deleteButton = screen.getAllByText("Delete")[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(`https://digt2107-project.onrender.com/tasks/${mockTask._id}`);
        });

        await waitFor(() => {
            expect(screen.queryByText(/Task to Delete/i)).not.toBeInTheDocument();
        });
    });

    test("sorts tasks by priority (TC-003)", async () => {
        axios.get.mockResolvedValueOnce({
            data: [
                { id: 1, title: "Low Task", priority: "Low", dueDate: "" },
                { id: 2, title: "Critical Task", priority: "Critical", dueDate: "" },
            ],
        });

        render(<Tasks />);

        const sortButton = screen.getByText("Sort Descending");
        fireEvent.click(sortButton);

        await waitFor(() => {
            const tasks = screen.getAllByRole("listitem");
            console.log("Sorted tasks:", tasks.map(task => task.textContent)); // Debugging output

            // Trim whitespace to avoid formatting mismatches
            const firstTaskText = tasks[0].textContent.trim();
            const secondTaskText = tasks[1].textContent.trim();

            expect(firstTaskText).toMatch(/Critical Task/);
            expect(secondTaskText).toMatch(/Low Task/);
        });
    });
});