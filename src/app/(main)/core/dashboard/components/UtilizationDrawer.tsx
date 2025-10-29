import React, { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { defaultDashboardServices } from "../services";
import { authUtils } from "@/lib/auth-utils";
import { Columns2Icon, DownloadIcon } from "lucide-react";

const CATEGORY_LABELS = {
    video: "Video",
    sms: "SMS",
    whatsapp: "WhatsApp",
} as const;

const ALL_COLUMNS = {
    video: [
        { key: "year", label: "Year" },
        { key: "month", label: "Month" },
        { key: "video_count", label: "Video Count" },
        { key: "video_minutes", label: "Video Minutes" },
        { key: "video_size", label: "Video Size (MB)" },
    ],
    sms: [
        { key: "year", label: "Year" },
        { key: "month", label: "Month" },
        { key: "sms_count", label: "SMS Count" },
        { key: "incoming_sms", label: "Incoming SMS" },
        { key: "outgoing_sms", label: "Outgoing SMS" },
    ],
    whatsapp: [
        { key: "year", label: "Year" },
        { key: "month", label: "Month" },
        { key: "whatsapp_count", label: "WhatsApp Count" },
        { key: "incoming_whatsapp", label: "Incoming WhatsApp" },
        { key: "outgoing_whatsapp", label: "Outgoing WhatsApp" },
    ],
} as const;

type UtilizationCategory = "video" | "sms" | "whatsapp";

interface UtilizationRow {
    year: string;
    month: string;
    video_count?: number;
    video_minutes?: number;
    video_size?: number;
    sms_count?: number;
    incoming_sms?: number;
    outgoing_sms?: number;
    whatsapp_count?: number;
    incoming_whatsapp?: number;
    outgoing_whatsapp?: number;
}

interface UtilizationApiResponse {
    status: boolean;
    data: [
        {
            next: string | null;
            previous: string | null;
            count: number;
            total_pages: number;
            results: UtilizationRow[];
        }
    ];
    error: any;
}

interface UtilizationDrawerProps {
    open: boolean;
    onClose: () => void;
    category: UtilizationCategory;
}

export const UtilizationDrawer: React.FC<UtilizationDrawerProps> = ({ open, onClose, category }) => {
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [exportType, setExportType] = useState<string>("");
    const [data, setData] = useState<UtilizationRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);

    const columns = ALL_COLUMNS[category];

    // Initialize visible columns when category changes
    useEffect(() => {
        setVisibleColumns(columns.map(c => c.key));
    }, [category]);

    // Fetch data
    const fetchData = async (pageNum: number) => {
        setLoading(true);
        setError(null);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
            const res: UtilizationApiResponse = await defaultDashboardServices.getUtilizationDetails(
                token,
                pageNum,
                category
            );

            if (res.status && res.data?.[0]) {
                setData(res.data[0].results);
                setCount(res.data[0].count);
                setTotalPages(res.data[0].total_pages || 1);
            } else {
                setData([]);
                setCount(0);
                setTotalPages(1);
                setError("No data found");
            }
        } catch (e) {
            setError("Failed to fetch data");
            setData([]);
            setCount(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    // Reset page and fetch on open
    useEffect(() => {
        if (open) {
            setPage(1);
            setVisibleColumns(columns.map(c => c.key));
            fetchData(1);
        }
    }, [open, category]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchData(newPage);
    };

    const handleToggleColumn = (key: string) => {
        setVisibleColumns(prev =>
            prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
        );
    };

    const handleExport = async (type: string) => {
        const exportData = data.map((row) => {
            const out: Record<string, any> = {};
            if (visibleColumns.includes("year")) out["Year"] = row.year;
            if (visibleColumns.includes("month")) out["Month"] = row.month;
            if (visibleColumns.includes("video_count")) out["Video Count"] = row.video_count ?? "-";
            if (visibleColumns.includes("video_minutes")) out["Video Minutes"] = row.video_minutes ?? "-";
            if (visibleColumns.includes("video_size")) out["Video Size (MB)"] = row.video_size ?? "-";
            if (visibleColumns.includes("sms_count")) out["SMS Count"] = row.sms_count ?? "-";
            if (visibleColumns.includes("incoming_sms")) out["Incoming SMS"] = row.incoming_sms ?? "-";
            if (visibleColumns.includes("outgoing_sms")) out["Outgoing SMS"] = row.outgoing_sms ?? "-";
            if (visibleColumns.includes("whatsapp_count")) out["WhatsApp Count"] = row.whatsapp_count ?? "-";
            if (visibleColumns.includes("incoming_whatsapp")) out["Incoming WhatsApp"] = row.incoming_whatsapp ?? "-";
            if (visibleColumns.includes("outgoing_whatsapp")) out["Outgoing WhatsApp"] = row.outgoing_whatsapp ?? "-";
            return out;
        });

        const fileName = `utilization_${category}`;
        let exported = false;

        try {
            if (type === "xlsx" || type === "csv") {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, CATEGORY_LABELS[category]);
                if (type === "xlsx") {
                    XLSX.writeFile(wb, `${fileName}.xlsx`);
                } else {
                    XLSX.writeFile(wb, `${fileName}.csv`, { bookType: "csv" });
                }
                exported = true;
            } else if (type === "pdf") {
                const { default: autoTable } = await import("jspdf-autotable");
                const doc = new jsPDF();
                const headers = columns.filter(c => visibleColumns.includes(c.key)).map(c => c.label);
                const body = exportData.map(row =>
                    columns.filter(c => visibleColumns.includes(c.key)).map(c => row[c.label] ?? "")
                );
                autoTable(doc, { head: [headers], body });
                doc.save(`${fileName}.pdf`);
                exported = true;
            } else if (type === "docx") {
                const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } = await import("docx");
                const tableRows = [
                    new TableRow({
                        children: columns
                            .filter(c => visibleColumns.includes(c.key))
                            .map(c => new TableCell({
                                children: [new Paragraph({ children: [new TextRun({ text: c.label, bold: true })] })]
                            }))
                    }),
                    ...exportData.map(row => new TableRow({
                        children: columns
                            .filter(c => visibleColumns.includes(c.key))
                            .map(c => new TableCell({
                                children: [new Paragraph({ children: [new TextRun(String(row[c.label] ?? ""))] })]
                            }))
                    }))
                ];

                const docFile = new Document({ sections: [{ children: [new Table({ rows: tableRows })] }] });
                const blob = await Packer.toBlob(docFile);
                saveAs(blob, `${fileName}.docx`);
                exported = true;
            }

            if (exported) {
                const user = authUtils.getUser();
                toast.success(`All set, ${user?.first_name || "User"}`, {
                    description: "Your data export is successful! You can now open the downloaded file to explore your insights",
                    duration: 6000,
                });
            }
        } catch (err) {
            toast.error("Export failed. Please try again.");
        }
    };

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="max-w-[100vw] w-full right-0 fixed top-0 h-full z-50 p-0 flex flex-col">
                <DrawerHeader className="flex flex-row items-center justify-center border-b px-6 py-4">
                    <DrawerTitle>{CATEGORY_LABELS[category]} Utilization</DrawerTitle>
                </DrawerHeader>

                <div className="flex flex-col gap-4 p-6 flex-1 overflow-auto">
                    {/* Toolbar: Only Columns + Export */}
                    <div className="flex justify-end items-center mb-2">
                        <div className="flex gap-2 items-center">
                            <DropdownMenu open={columnsDropdownOpen} onOpenChange={setColumnsDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <Columns2Icon className="size-4" /> Columns
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="min-w-[180px]">
                                    {columns.map(col => (
                                        <DropdownMenuCheckboxItem
                                            key={col.key}
                                            checked={visibleColumns.includes(col.key)}
                                            onCheckedChange={() => handleToggleColumn(col.key)}
                                            onSelect={e => e.preventDefault()}
                                        >
                                            {col.label}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Select value={exportType} onValueChange={val => { setExportType(val); handleExport(val); }}>
                                <SelectTrigger className="w-36 text-foreground" size="sm">
                                    <DownloadIcon className="size-4 mr-1 text-foreground font-medium" />
                                    <span className="text-foreground font-medium"><SelectValue placeholder="Export As" /></span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="xlsx">Excel</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                    <SelectItem value="docx">Word</SelectItem>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex justify-center items-center h-40"><Spinner /></div>
                    ) : error ? (
                        <div className="text-destructive text-center py-8">{error}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {columns
                                            .filter(col => visibleColumns.includes(col.key))
                                            .map(col => (
                                                <TableHead key={col.key} className="text-center">
                                                    {col.label}
                                                </TableHead>
                                            ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={visibleColumns.length} className="text-center">
                                                No data found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((row, idx) => (
                                            <TableRow key={idx}>
                                                {visibleColumns.includes("year") && <TableCell className="text-center">{row.year}</TableCell>}
                                                {visibleColumns.includes("month") && <TableCell className="text-center">{row.month}</TableCell>}
                                                {visibleColumns.includes("video_count") && <TableCell className="text-center">{row.video_count ?? "-"}</TableCell>}
                                                {visibleColumns.includes("video_minutes") && <TableCell className="text-center">{row.video_minutes ?? "-"}</TableCell>}
                                                {visibleColumns.includes("video_size") && <TableCell className="text-center">{row.video_size ?? "-"}</TableCell>}
                                                {visibleColumns.includes("sms_count") && <TableCell className="text-center">{row.sms_count ?? "-"}</TableCell>}
                                                {visibleColumns.includes("incoming_sms") && <TableCell className="text-center">{row.incoming_sms ?? "-"}</TableCell>}
                                                {visibleColumns.includes("outgoing_sms") && <TableCell className="text-center">{row.outgoing_sms ?? "-"}</TableCell>}
                                                {visibleColumns.includes("whatsapp_count") && <TableCell className="text-center">{row.whatsapp_count ?? "-"}</TableCell>}
                                                {visibleColumns.includes("incoming_whatsapp") && <TableCell className="text-center">{row.incoming_whatsapp ?? "-"}</TableCell>}
                                                {visibleColumns.includes("outgoing_whatsapp") && <TableCell className="text-center">{row.outgoing_whatsapp ?? "-"}</TableCell>}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 px-6 py-1 bg-background">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1 || loading}
                    >
                        Previous
                    </Button>
                    <span className="self-center text-sm">Page {page} of {totalPages}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages || loading}
                    >
                        Next
                    </Button>
                </div>
            </DrawerContent>
        </Drawer>
    );
};