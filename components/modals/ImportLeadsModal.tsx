"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { importLeads } from "@/actions/crm/leads/import-leads";

import Papa from "papaparse";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2 } from "lucide-react";

type Step = "upload" | "mapping" | "preview";

interface LeadField {
  key: string;
  label: string;
  required: boolean;
}

const LEAD_FIELDS: LeadField[] = [
  { key: "lastName", label: "Last Name", required: true },
  { key: "firstName", label: "First Name", required: false },
  { key: "email", label: "Email", required: false },
  { key: "phone", label: "Phone", required: false },
  { key: "company", label: "Company", required: true },
  { key: "jobTitle", label: "Job Title", required: false },
  { key: "description", label: "Description", required: false },
];

const SKIP_VALUE = "__skip__";

const ImportLeadsModal = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const resetState = () => {
    setStep("upload");
    setSelectedFile(null);
    setCsvHeaders([]);
    setCsvRows([]);
    setMapping({});
    setIsLoading(false);
    setIsSuggesting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetState();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        setCsvHeaders(headers);
        setCsvRows(results.data);
        fetchSuggestedMapping(headers);
      },
    });
  };

  const fetchSuggestedMapping = useCallback((headers: string[]) => {
    setStep("mapping");
    const newMapping: Record<string, string> = {};
    for (const field of LEAD_FIELDS) {
      newMapping[field.key] = SKIP_VALUE;
    }
    for (const header of headers) {
      const match = LEAD_FIELDS.find(
        (f) => f.key.toLowerCase() === header.toLowerCase() || f.label.toLowerCase() === header.toLowerCase()
      );
      if (match && newMapping[match.key] === SKIP_VALUE) {
        newMapping[match.key] = header;
      }
    }
    setMapping(newMapping);
  }, []);

  const computePreview = () => {
    let valid = 0;
    let skipped = 0;
    const skipReasons: string[] = [];

    for (let i = 0; i < csvRows.length; i++) {
      const raw = csvRows[i];
      const row: Record<string, string> = {};
      for (const field of LEAD_FIELDS) {
        const csvCol = mapping[field.key];
        if (csvCol && csvCol !== SKIP_VALUE) {
          row[field.key] = raw[csvCol] ?? "";
        }
      }

      if (!row.lastName && !row.company) {
        skipped++;
        if (skipReasons.length < 3) skipReasons.push(`Row ${i + 2}: missing Last Name or Company`);
        continue;
      }
      valid++;
    }

    return { valid, skipped, skipReasons };
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    const apiMapping: Record<string, string> = {};
    for (const [targetField, csvCol] of Object.entries(mapping)) {
      if (csvCol && csvCol !== SKIP_VALUE) {
        apiMapping[csvCol] = targetField;
      }
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("mapping", JSON.stringify(apiMapping));

    try {
      const { imported, skipped, errors } = await importLeads(formData);
      toast.success(`Imported: ${imported}, Skipped: ${skipped}${errors.length > 0 ? `. Errors: ${errors.slice(0, 3).join("; ")}` : ""}`);
      setOpen(false);
      resetState();
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const preview = step === "preview" ? computePreview() : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Import Leads from CSV
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              Step {step === "upload" ? 1 : step === "mapping" ? 2 : 3} of 3
            </span>
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Select a CSV file to import leads."}
            {step === "mapping" && "Map your CSV columns to lead fields."}
            {step === "preview" && "Review the import summary before proceeding."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-2">
            <div className="border-2 border-dashed rounded-md p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Select CSV file
              </Button>
              {selectedFile && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </div>
        )}

        {step === "mapping" && (
          <div className="space-y-3 py-2">
              <div className="space-y-1">
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground px-1 pb-1">
                  <span>CRM Field</span>
                  <span>CSV Column</span>
                </div>
                {LEAD_FIELDS.map((field) => (
                  <div key={field.key} className="grid grid-cols-2 gap-2 items-center">
                    <span className="text-sm">
                      {field.label}
                      {field.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </span>
                    <Select
                      value={mapping[field.key] ?? SKIP_VALUE}
                      onValueChange={(val) =>
                         setMapping((prev) => ({ ...prev, [field.key]: val }))
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="— skip —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SKIP_VALUE}>— skip —</SelectItem>
                        {csvHeaders.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-1">
                  <span className="text-destructive">*</span> Last Name or Company is required.
                </p>
              </div>
          </div>
        )}

        {step === "preview" && preview && (
          <div className="space-y-4 py-2">
            <div className="rounded-md border p-4 space-y-1">
              <p className="text-sm font-medium">
                Ready to import{" "}
                <span className="text-green-600 dark:text-green-400">
                  {preview.valid} row{preview.valid !== 1 ? "s" : ""}
                </span>
                {preview.skipped > 0 && (
                  <>
                    {" "}— {" "}
                    <span className="text-yellow-600 dark:text-yellow-400">
                      {preview.skipped} row{preview.skipped !== 1 ? "s" : ""} will be skipped
                    </span>
                  </>
                )}
                .
              </p>
              {preview.skipReasons.length > 0 && (
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5 pt-1">
                  {preview.skipReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                  {preview.skipped > preview.skipReasons.length && (
                    <li>…and {preview.skipped - preview.skipReasons.length} more</li>
                  )}
                </ul>
              )}
            </div>
            {preview.valid === 0 && (
              <p className="text-sm text-destructive">
                No valid rows to import. Go back and adjust your column mapping.
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:gap-0">
          {step === "upload" && (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
          )}

          {step === "mapping" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button
                onClick={() => setStep("preview")}
                disabled={isSuggesting}
              >
                Next
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("mapping")} disabled={isLoading}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={isLoading || !preview || preview.valid === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing…
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportLeadsModal;
