import { Schema, model, models } from "mongoose";

const ExpenseCategorySchema = new Schema(
    {
        category: { type: String, required: true },
    },
    { timestamps: true }
);

export default models.ExpenseCategory || model("ExpenseCategory", ExpenseCategorySchema);