"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TipTapEditor } from "@/components/campaigns/TipTapEditor";
import { createTemplate } from "@/actions/campaigns/templates/create-template";
import { updateTemplate } from "@/actions/campaigns/templates/update-template";


type InitialData = {
  name: string;
  description?: string | null;
  subject_default?: string | null;
  content_html?: string | null;
  content_json?: object | null;
};

type Props = {
  initialData?: InitialData;
  templateId?: string;
};

export default function TemplateEditorForm({ initialData, templateId }: Props) {
  const router = useRouter();
  const isEditing = !!templateId;

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [subject, setSubject] = useState(initialData?.subject_default ?? "");
  const [contentHtml, setContentHtml] = useState(
    initialData?.content_html ?? ""
  );
  const [contentJson, setContentJson] = useState<object>(
    initialData?.content_json ?? {}
  );

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditorChange = (html: string, json: object) => {
    setContentHtml(html);
    setContentJson(json);
  };



  const handleSave = async () => {
    if (!name.trim()) {
      setError("Template name is required");
      return;
    }
    if (!subject.trim()) {
      setError("Subject line is required");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      if (isEditing && templateId) {
        await updateTemplate(templateId, {
          name,
          description: description || undefined,
          subject_default: subject,
          content_html: contentHtml,
          content_json: contentJson,
        });
      } else {
        await createTemplate({
          name,
          description: description || undefined,
          subject_default: subject,
          content_html: contentHtml,
          content_json: contentJson,
        });
      }
      router.push("/campaigns/templates");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Basic fields */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Template Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Welcome Email"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={2}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="subject">Subject Line *</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Hi {{first_name}}, a quick note from us"
            required
          />
        </div>
      </div>



      {/* TipTap Editor */}
      <div className="flex flex-col gap-2">
        <Label>Email Body</Label>
        <TipTapEditor content={contentHtml} onChange={handleEditorChange} />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : isEditing ? "Update Template" : "Save Template"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/campaigns/templates")}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
