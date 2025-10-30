import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "FieldLink CRM",
  company: "GoDeskless Inc.",
  version: packageJson.version,
  copyright: `© ${currentYear}, GoDeskless Inc.`,
  meta: {
    title: "FieldLink CRM by GoDeskless Inc.",
    description:
      "FieldLink CRM by GoDeskless Inc. is a modern field service management platform for asset management, ticketing, scheduling, and analytics. Built with Next.js 16, Tailwind CSS v4, and shadcn/ui.",
  },
};
