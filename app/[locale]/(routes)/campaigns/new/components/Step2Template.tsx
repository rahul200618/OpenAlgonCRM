"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TipTapEditor } from "@/components/campaigns/TipTapEditor";


type Template = {
  id: string;
  name: string;
  subject_default: string | null;
  content_html: string;
};

type Props = {
  initialData: {
    template_id?: string;
    content_html?: string;
    subject?: string;
  };
  templates: Template[];
  onNext: (data: {
    template_id?: string;
    content_html: string;
    content_json: object;
    subject: string;
  }) => void;
  onBack: () => void;
};

export function Step2Template({
  initialData,
  templates,
  onNext,
  onBack,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState(initialData.subject ?? "");
  const [html, setHtml] = useState(initialData.content_html ?? "");
  const [json, setJson] = useState<object>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.template_id ?? ""
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");



  const handleSelectTemplate = (t: Template) => {
    setSelectedTemplateId(t.id);
    setHtml(t.content_html);
    setSubject(t.subject_default ?? "");
  };

  const handleNext = () => {
    if (!subject.trim()) {
      setError("Subject line is required");
      return;
    }
    if (!html.trim()) {
      setError("Email content is required");
      return;
    }
    onNext({
      template_id: selectedTemplateId || undefined,
      content_html: html,
      content_json: json,
      subject,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="existing">
        <TabsList>
          <TabsTrigger value="existing">Choose Existing Template</TabsTrigger>
        </TabsList>
        <TabsContent value="existing" className="pt-3">
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto border rounded-md p-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`text-left px-3 py-2 rounded text-sm hover:bg-muted ${
                  selectedTemplateId === t.id ? "bg-muted font-medium" : ""
                }`}
                onClick={() => handleSelectTemplate(t)}
              >
                {t.name}
              </button>
            ))}
            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">
                No templates yet.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col gap-1.5">
        <Label>Subject Line *</Label>
        <Input
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setError("");
          }}
          placeholder="Your email subject..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Email Content</Label>
        <TipTapEditor
          content={html}
          onChange={(newHtml, newJson) => {
            setHtml(newHtml);
            setJson(newJson);
            setError("");
          }}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={handleNext}>Next →</Button>
      </div>
    </div>
  );
}
