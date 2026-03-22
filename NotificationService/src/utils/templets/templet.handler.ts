import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";
import { InternalServerError } from "../errors/app.error";

export async function readMailTemplate(
  templateId: string,
  params: Record<string, any>,
): Promise<string> {
  try {
    const templatePath = path.join(__dirname, `${templateId}.hbs`);

    const fileContent = await fs.readFile(templatePath, "utf-8");

    const compiledTemplate = Handlebars.compile(fileContent);

    return compiledTemplate(params);
  } catch (error) {
    throw new InternalServerError(`Template not found: ${templateId}`);
  }
}
