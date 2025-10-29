import React, { useEffect, useState, useRef } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { formatToIST } from "@/lib/utils";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { Spinner } from "@/components/ui/spinner";
import { defaultDashboardServices } from "../services";
import { toast } from "sonner";
import { Columns2Icon, DownloadIcon } from "lucide-react";
import { authUtils } from "@/lib/auth-utils";

interface User {
    id: number;
    full_name: string;
    email: string;
    last_login?: string;
    agent_info?: {
        group_name?: string[];
        last_activity?: {
            activity_name?: string;
            highest_time?: string;
            id?: number;
            name?: string;
        };
    };
}

interface ApiResponse {
    status: boolean;
    data: [
        {
            next: string | null;
            previous: string | null;
            count: number;
            total_pages: number;
            results: User[];
        }
    ];
    error: any;
}

interface Props {
    open: boolean;
    onClose: () => void;
}

const ALL_COLUMNS = [
    { key: "no", label: "No." },
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "group", label: "Group" },
    { key: "last_login", label: "Last Login Date" },
    { key: "last_activity", label: "Last Activity" },
    { key: "last_activity_time", label: "Last Activity Time" },
    { key: "visit_id", label: "Visit ID" },
    { key: "visit_subject", label: "Visit Subject" },
];

export const LoggedInUsersDrawer: React.FC<Props> = ({ open, onClose }) => {
    const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.key));
    const [exportType, setExportType] = useState<string>("");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [count, setCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Column toggle logic (multi-select, keep open)
    const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
    const handleToggleColumn = (key: string) => {
        setVisibleColumns(cols =>
            cols.includes(key) ? cols.filter(c => c !== key) : [...cols, key]
        );
    }

    // Export logic with dynamic PDF plugin and Sonner toast
    const handleExport = async (type: string) => {
        const exportData = users.map((user, idx) => {
            const row: Record<string, any> = {};
            if (visibleColumns.includes("no")) row["No."] = (page - 1) * 10 + idx + 1;
            if (visibleColumns.includes("full_name")) row["Name"] = user.full_name;
            if (visibleColumns.includes("email")) row["Email"] = user.email;
            if (visibleColumns.includes("group")) row["Group"] = user.agent_info?.group_name?.join(", ") || "-";
            if (visibleColumns.includes("last_login")) row["Last Login Date"] = formatToIST(user.last_login || "");
            if (visibleColumns.includes("last_activity")) row["Last Activity"] = user.agent_info?.last_activity?.activity_name || "-";
            if (visibleColumns.includes("last_activity_time")) row["Last Activity Time"] = formatToIST(user.agent_info?.last_activity?.highest_time || "");
            if (visibleColumns.includes("visit_id")) row["Visit ID"] = user.agent_info?.last_activity?.id || "-";
            if (visibleColumns.includes("visit_subject")) row["Visit Subject"] = user.agent_info?.last_activity?.name || "-";
            return row;
        });
        let fileName = "logged_in_users";
        let exported = false;
        try {
            if (type === "xlsx" || type === "csv") {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Users");
                if (type === "xlsx") {
                    XLSX.writeFile(wb, `${fileName}.xlsx`);
                } else {
                    XLSX.writeFile(wb, `${fileName}.csv`, { bookType: "csv" });
                }
                exported = true;
            } else if (type === "pdf") {
                const autoTable = (await import("jspdf-autotable")).default;
                const doc = new jsPDF();
                autoTable(doc, {
                    head: [ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(c => c.label)],
                    body: exportData.map(row => ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(c => row[c.label] ?? "")),
                });
                doc.save(`${fileName}.pdf`);
                exported = true;
            } else if (type === "docx") {
                const docx = await import("docx");
                const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } = docx;
                const tableRows = [
                    new TableRow({
                        children: ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(c => new TableCell({ children: [new Paragraph({ children: [new TextRun(c.label)] })] }))
                    }),
                    ...exportData.map(row => new TableRow({
                        children: ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(c => new TableCell({ children: [new Paragraph({ children: [new TextRun(row[c.label] ?? "")] })] }))
                    }))
                ];
                const docFile = new Document({
                    sections: [{ children: [new Table({ rows: tableRows })] }],
                });
                const blob = await Packer.toBlob(docFile);
                saveAs(blob, `${fileName}.docx`);
                exported = true;
            }
            if (exported) {
                const user = authUtils.getUser();
                toast.success(
                    `All set, ${user?.first_name || "User"} 📂`,
                    {
                        description: "Your data export is succesfull! You can now open the downloaded file to explore your insights",
                        duration: 6000, // toast visible for 6 seconds
                    }
                );
            }
        } catch (err) {
            toast.error("Export failed. Please try again.");
        }
    };

    const fetchUsers = async (pageNum = 1, searchText = "") => {
        setLoading(true);
        setError(null);
        try {
            const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : '';
            const data = await defaultDashboardServices.getLoggedInUsers(token, pageNum, searchText);
            if (data.status && data.data && data.data[0]) {
                setUsers(data.data[0].results);
                setCount(data.data[0].count);
                setTotalPages(data.data[0].total_pages);
            } else {
                setUsers([]);
                setCount(0);
                setTotalPages(1);
                setError("No users found");
            }
        } catch (e) {
            setError("Failed to fetch users");
            setUsers([]);
            setCount(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            setPage(1);
            setSearch("");
            setSearchInput("");
            fetchUsers(1, "");
        }
    }, [open]);

    const handleSearch = () => {
        setPage(1);
        setSearch(searchInput);
        fetchUsers(1, searchInput);
    };

    const handleReset = () => {
        setPage(1);
        setSearch("");
        setSearchInput("");
        fetchUsers(1, "");
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchUsers(newPage, search);
    };

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="max-w-[100vw] w-full right-0 fixed top-0 h-full z-50 p-0 flex flex-col">
                <DrawerHeader className="flex flex-row items-center justify-center border-b px-6 py-4">
                    <DrawerTitle className="justify-center">Logged In Users</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-4 p-6 flex-1 overflow-auto">
                    {/* Toolbar: columns, export, search, reset */}
                    <div className="flex flex-wrap gap-2 items-center justify-between w-full mb-2">
                        <div className="flex gap-2 items-center w-full sm:w-auto">
                            <Input
                                placeholder="Search by name or email"
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                className="w-full sm:w-64"
                                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                            />
                            <Button onClick={handleSearch} disabled={loading} size="sm">Search</Button>
                            <Button onClick={handleReset} variant="outline" disabled={loading} size="sm">Reset</Button>
                        </div>
                        <div className="flex gap-2 items-center">
                            <DropdownMenu open={columnsDropdownOpen} onOpenChange={setColumnsDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <Columns2Icon className="size-4" /> Columns
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="min-w-[180px]">
                                    {ALL_COLUMNS.map(col => (
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
                                    <span><DownloadIcon className="size-4 mr-1 text-foreground font-medium" /></span>
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
                                        {ALL_COLUMNS.filter(col => visibleColumns.includes(col.key)).map(col => (
                                            <TableHead key={col.key} className="text-center">{col.label}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={visibleColumns.length} className="text-center">No users found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user, idx) => (
                                            <TableRow key={user.id}>
                                                {visibleColumns.includes("no") && <TableCell className="text-center">{(page - 1) * 10 + idx + 1}</TableCell>}
                                                {visibleColumns.includes("full_name") && <TableCell className="text-center">{user.full_name}</TableCell>}
                                                {visibleColumns.includes("email") && <TableCell className="text-center">{user.email}</TableCell>}
                                                {visibleColumns.includes("group") && <TableCell className="text-center">{user.agent_info?.group_name?.length ? user.agent_info.group_name.join(", ") : "-"}</TableCell>}
                                                {visibleColumns.includes("last_login") && <TableCell className="text-center">{formatToIST(user.last_login || "")}</TableCell>}
                                                {visibleColumns.includes("last_activity") && <TableCell className="text-center">{user.agent_info?.last_activity?.activity_name || "-"}</TableCell>}
                                                {visibleColumns.includes("last_activity_time") && <TableCell className="text-center">{formatToIST(user.agent_info?.last_activity?.highest_time || "")}</TableCell>}
                                                {visibleColumns.includes("visit_id") && <TableCell className="text-center">{user.agent_info?.last_activity?.id || "-"}</TableCell>}
                                                {visibleColumns.includes("visit_subject") && <TableCell className="text-center">{user.agent_info?.last_activity?.name || "-"}</TableCell>}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
                {/* Pagination in footer */}
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
