"use client"

import * as React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Editor } from '@tiptap/core'

import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image as TiptapImage } from "@tiptap/extension-image"
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"
import Placeholder from '@tiptap/extension-placeholder'

// --- Custom Extensions ---
import { Link } from "@/components/tiptap-extension/link-extension"
import { Selection } from "@/components/tiptap-extension/selection-extension"
import { TrailingNode } from "@/components/tiptap-extension/trailing-node-extension"
import Iframe from "@/components/tiptap-extension/iframe-extension"
import { AdPlaceholder } from "@/components/tiptap-extension/ad-placeholder-extension"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Shadcn/UI Components ---
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { CodeIcon, DollarSign, Loader2, PenSquare, Save, Sparkles, Upload } from "lucide-react"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { NodeButton } from "@/components/tiptap-ui/node-button"
import {
  HighlightPopover,
  HighlightContent,
  HighlighterButton,
} from "@/components/tiptap-ui/highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"
import { EmbedButton, EmbedContent, EmbedPopover } from "@/components/tiptap-ui/embed-button"
import { AdPlaceholderButton, AdPlaceholderContent, AdPlaceholderPopover } from "@/components/tiptap-ui/ad-placeholder-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useMobile } from "@/hooks/use-mobile"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"
import { generateSlug } from "@/lib/utils"

// --- Styles ---
import "./simple-editor.scss"
import "@/styles/globals.css"

// --- Default Content (Optional) ---
import defaultContent from "./data/content"
import { AiAssistant } from "./ai-assistant"

// --- Feature Image Uploader Component ---
import { ImageUploader } from "./image-uploader"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X as XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { PLAN_LIMITS } from "@/config/plans"

// --- Zod Schema for Validation ---
const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  excerpt: z.string().optional(),
  featuredImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  content: z.string().min(10, "Content must be at least 10 characters long."),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  organizationId: z.string().min(1, "Organization ID is required."),
  // --- FIX: Allow `null` as a valid value for categoryId ---
  // This ensures that when the database returns `null` for an unassigned category,
  // validation does not fail.
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

// --- Toolbar Components (Keep as is) ---
const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  onEmbedClick,
  onAdPlaceholderClick,
  isMobile,
  setShowAiAssistant
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  onEmbedClick: () => void
  onAdPlaceholderClick: () => void
  isMobile: boolean
  setShowAiAssistant: (show: boolean) => void
}) => {
  return (
    <>
      <Spacer />
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <NodeButton type="codeBlock" />
        <NodeButton type="blockquote" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <HighlightPopover />
        ) : (
          <HighlighterButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <Button type="button" onClick={() => setShowAiAssistant(true)} aria-label="AI Assistant">
          <Sparkles className="h-4 w-4 mr-1" /> AI
        </Button>
      </ToolbarGroup>
      <ToolbarGroup>
        <ImageUploadButton />
        {!isMobile ? <EmbedPopover /> : <EmbedButton onClick={onEmbedClick} />}
        {!isMobile ? <AdPlaceholderPopover /> : <AdPlaceholderButton onClick={onAdPlaceholderClick} />}
      </ToolbarGroup>
      <Spacer />
      {isMobile && <ToolbarSeparator />}
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link" | "embed" | "ad-placeholder"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : type === "link" ? (
          <LinkIcon className="tiptap-button-icon" />
        ) : type === "embed" ? (
          <CodeIcon className="tiptap-button-icon" />
        ) : (
          <DollarSign className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>
    <ToolbarSeparator />
    {type === "highlighter" ? (
      <HighlightContent />
    ) : type === "link" ? (
      <LinkContent />
    ) : type === "embed" ? (
      <EmbedContent />
    ) : (
      <AdPlaceholderContent />
    )}
  </>
)

// --- Main Editor Component ---
export function BlogEditor({ organizationId, post, drafts, organizationPlan }: {
  organizationId: string;
  post?: any;
  drafts?: any[];
  organizationPlan: any;
}) {

  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMobile = useMobile()
  const [mobileView, setMobileView] = React.useState<"main" | "highlighter" | "link" | "embed" | "ad-placeholder">("main")
  const [editorContent, setEditorContent] = useState<any>(post?.content || defaultContent)
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [showImageUploader, setShowImageUploader] = useState(false);
  const isSlugManuallyEdited = useRef(false);

  const [isDraftDialogOpen, setIsDraftDialogOpen] = useState(drafts && drafts.length > 0 && !post);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(post?.id || null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(post?.updatedAt ? new Date(post.updatedAt) : null);

  const [categories, setCategories] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const planName = organizationPlan as keyof typeof PLAN_LIMITS;
  const planLimits = PLAN_LIMITS[planName];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/organizations/categories');
        if (response.ok) setCategories(await response.json());
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag) && tags.length < planLimits.tagsPerPost) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        form.setValue('tags', newTags, { shouldDirty: true, shouldValidate: true });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue('tags', newTags, { shouldDirty: true, shouldValidate: true });
  };

  const findFirstH1Text = (editorInstance: Editor): string | null => {
    let firstH1Text: string | null = null;
    editorInstance.state.doc.forEach((node) => {
      if (!firstH1Text && node.type.name === 'heading' && node.attrs.level === 1) {
        firstH1Text = node.textContent.trim()
      }
    })
    return firstH1Text
  }

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      id: post?.id,
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      featuredImage: post?.featuredImage || "",
      metaTitle: post?.metaTitle || "",
      metaDescription: post?.metaDescription || "",
      content: post?.content || defaultContent,
      organizationId: post?.organizationId || organizationId,
      categoryId: post?.categoryId || null, // Ensure default is null, not undefined
      tags: post?.tags || [],
    },
    mode: 'onChange',
  })

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none p-4 min-h-[300px]",
        "aria-label": "Main content area, start typing to enter text.",
      },
    },
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Placeholder.configure({ placeholder: 'Start with a Heading 1 for your title...' }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline, TaskList, TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }), TiptapImage, Iframe, AdPlaceholder,
      Typography, Superscript, Subscript, Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        upload: handleImageUpload,
        onError: (error) => {
          toast({
            title: "Image Upload Failed",
            description: error.message || "Could not upload image.",
            variant: "destructive",
          })
        },
      }),
      TrailingNode,
      Link.configure({ openOnClick: false }),
    ],
    content: editorContent,
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      const jsonContent = editor.getJSON();
      setEditorContent(jsonContent);
      form.setValue("content", htmlContent, { shouldValidate: true, shouldDirty: true });

      const firstH1 = findFirstH1Text(editor);
      const currentTitle = form.getValues("title");
      if (firstH1 && firstH1 !== currentTitle) {
          form.setValue("title", firstH1, { shouldValidate: true, shouldDirty: true });
          if (!isSlugManuallyEdited.current) {
              form.setValue("slug", generateSlug(firstH1), { shouldValidate: true, shouldDirty: true });
          }
      }
    },
  })

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const watchedFormData = form.watch();

  const handleAutoSave = useCallback(async () => {
    if (!form.formState.isDirty) {
      console.log('form isn not dirty inside auto save callback')
        setSaveStatus('idle');
        return;
    }
    setSaveStatus('saving');
    console.log('saving draft post automatically')

    const isValid = await form.trigger();
    if (!isValid) {
        setSaveStatus('error');
        toast({
            title: "Cannot save draft",
            description: "Please check the highlighted fields for errors.",
            variant: "destructive",
        });
        return;
    }

    const currentValues = form.getValues();
    try {
      let savedDraft;
      const payload = { ...currentValues, organizationId };
      const apiEndpoint = currentDraftId ? `/api/drafts/${currentDraftId}` : '/api/drafts';
      const apiMethod = currentDraftId ? 'PUT' : 'POST';

      const response = await fetch(apiEndpoint, {
        method: apiMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save draft.");
      savedDraft = await response.json();

      if (!currentDraftId) {
        setCurrentDraftId(savedDraft.id);
        router.replace(`/dashboard/editor/${savedDraft.id}`, { scroll: false });
      }

      setSaveStatus('saved');
      setLastSaved(new Date(savedDraft.updatedAt));
      form.reset(savedDraft);

    } catch (error) {
      setSaveStatus('error');
      console.error("Auto-save failed:", error);
    }
  }, [form, currentDraftId, organizationId, router, toast]);

  useEffect(() => {
    if (form.formState.isDirty) {
      console.log("passed if for auto save")
      setSaveStatus('idle');
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        console.log("auto saving...")
        handleAutoSave();
      }, 3000);
    }
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [watchedFormData, form.formState.isDirty, handleAutoSave]);


  async function onSubmit(values: z.infer<typeof postSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSaveStatus('saving');

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    try {
        let finalDraftId = currentDraftId;
        if (form.formState.isDirty || !finalDraftId) {
            const latestValues = form.getValues();
            const payload = { ...latestValues, organizationId };
            const draftApiEndpoint = finalDraftId ? `/api/drafts/${finalDraftId}` : '/api/drafts';
            const draftApiMethod = finalDraftId ? 'PUT' : 'POST';

            console.log(draftApiEndpoint, draftApiMethod)

            const saveResponse = await fetch(draftApiEndpoint, {
                method: draftApiMethod,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!saveResponse.ok) throw new Error("Failed to save the final draft before publishing.");
            const savedDraft = await saveResponse.json();
            finalDraftId = savedDraft.id;
        }

      const publishResponse = await fetch(`/api/posts/${finalDraftId}/publish`, {
        method: 'POST',
      });
      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(errorData.message || "An unknown error occurred during publishing.");
      }

      toast({
        title: post ? "Post Updated!" : "Post Published!",
        description: "Your post is now live.",
      });

      router.push('/dashboard/posts');
      router.refresh();

    } catch (error: any) {
      console.error("Publishing error:", error);
      toast({
        title: "Error Publishing",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      setSaveStatus('error');
    }
  }

  const handleSelectDraft = (draft: any) => {
    form.reset(draft);
    if (editor) editor.commands.setContent(draft.content || '');
    setCurrentDraftId(draft.id);
    setLastSaved(new Date(draft.updatedAt));
    setSaveStatus('saved');
    router.replace(`/dashboard/editor/${draft.id}`, { scroll: false });
    setIsDraftDialogOpen(false);
  }

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && value.title && !isSlugManuallyEdited.current) {
        form.setValue("slug", generateSlug(value.title), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleAiSuggestion = useCallback((suggestion: any) => {
      if (!editor || !suggestion) return;
      editor.commands.setContent(suggestion, true);
      form.setValue("content", editor.getHTML(), { shouldValidate: true, shouldDirty: true });
      setTimeout(() => {
        const newH1 = findFirstH1Text(editor);
        if (newH1) {
            form.setValue("title", newH1, { shouldValidate: true, shouldDirty: true });
            if (!isSlugManuallyEdited.current) {
                form.setValue("slug", generateSlug(newH1), { shouldValidate: true, shouldDirty: true });
            }
        }
      }, 100);
    }, [editor, form]);

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  const handleFeaturedImageUploaded = (url: string) => {
    form.setValue("featuredImage", url, { shouldValidate: true, shouldDirty: true });
    setShowImageUploader(false);
  };

  if (!editor) {
    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  return (
    <>
      <Dialog open={isDraftDialogOpen} onOpenChange={setIsDraftDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Continue Your Work</DialogTitle><DialogDescription>You have unpublished drafts. Choose one to continue editing or start a new post.</DialogDescription></DialogHeader>
          <div className="space-y-2 py-4 max-h-[300px] overflow-y-auto">
            {drafts?.map(draft => (
              <button key={draft.id} onClick={() => handleSelectDraft(draft)} className="w-full text-left p-2 rounded-md hover:bg-accent">
                <p className="font-medium">{draft.title || "Untitled Draft"}</p>
                <p className="text-sm text-muted-foreground">Last saved {format(new Date(draft.updatedAt), "MMM d, yyyy 'at' h:mm a")}</p>
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={() => setIsDraftDialogOpen(false)}>Start a New Post</Button>
        </DialogContent>
      </Dialog>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormDescription>Auto-generated, or edit manually.</FormDescription>
                  <FormControl><Input placeholder="Auto-generated from editor H1" {...field} className="bg-muted/50 border-dashed" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormDescription>Auto-generated, or edit manually.</FormDescription>
                  <FormControl>
                    <Input
                      placeholder="auto-generated-slug"
                      {...field}
                      onChange={(e) => {
                        isSlugManuallyEdited.current = e.target.value !== ""
                        field.onChange(generateSlug(e.target.value))
                      }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
          </div>

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt (Optional)</FormLabel>
                <FormControl><Textarea placeholder="A short summary for previews and meta description fallback" {...field} rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

          <FormField
            control={form.control}
            name="featuredImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image URL (Optional)</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                  <Button type="button" variant="outline" onClick={() => setShowImageUploader(true)} aria-label="Upload Featured Image">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>Enter a URL directly or upload an image.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  {/* FIX: Set value to handle `null` and add a "None" option */}
                  <Select
                    onValueChange={(value) => {
                      // If user selects "none", set form value to null. Otherwise, use the selected value.
                      field.onChange(value === "--none--" ? null : value);
                    }}
                    value={field.value || "--none--"} // Ensure `null` or `undefined` maps to the "None" selection
                  >
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="--none--">None</SelectItem>
                      {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormDescription>Group this post under a specific category.</FormDescription>
                   <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Tags / Keywords</FormLabel>
                <div className="flex min-h-[40px] w-full flex-wrap items-center gap-2 rounded-md border border-input px-3 py-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))}
                <Input
                  placeholder="Add a tag..."
                  className="flex-1 border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  disabled={tags.length >= planLimits.tagsPerPost}
                />
              </div>
              <FormDescription>Add up to {planLimits.tagsPerPost} tags. Press Enter or comma to add.</FormDescription>
            </FormItem>
          </div>
          <Separator />

          <EditorContext.Provider value={{ editor }}>
            <Toolbar sticky className="custom-toolbar-scroll">
              {mobileView === "main" ? (
                <MainToolbarContent
                  onEmbedClick={() => setMobileView("embed")}
                  onAdPlaceholderClick={() => setMobileView("ad-placeholder")}
                  onHighlighterClick={() => setMobileView("highlighter")}
                  onLinkClick={() => setMobileView("link")}
                  isMobile={isMobile}
                  setShowAiAssistant={setShowAiAssistant} />
              ) : (
                <MobileToolbarContent type={mobileView} onBack={() => setMobileView("main")} />
              )}
            </Toolbar>
            <div className="content-wrapper mt-2 rounded-md border bg-background shadow-sm">
              <EditorContent editor={editor} className="simple-editor-content"/>
            </div>
            <FormMessage>{form.formState.errors.content?.message}</FormMessage>
          </EditorContext.Provider>
          <Separator />

          <h2 className="text-lg font-semibold">SEO Settings (Optional)</h2>
          <div className="space-y-4 rounded-md border p-4">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl><Input placeholder="SEO Title (defaults to post title)" {...field} /></FormControl>
                  <FormDescription>Recommended length: 50-60 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl><Textarea placeholder="SEO Description (defaults to excerpt)" {...field} rows={3} /></FormControl>
                  <FormDescription>Recommended length: 150-160 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
          </div>
          <Separator />

          <div className="flex items-center justify-end space-x-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {saveStatus === 'saving' && <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>}
              {saveStatus === 'saved' && lastSaved && <><Clock className="h-4 w-4" /> Last saved {format(lastSaved, "h:mm:ss a")}</>}
              {saveStatus === 'error' && <span className="text-destructive">Save failed</span>}
              {saveStatus === 'idle' && form.formState.isDirty && <span className="text-muted-foreground">Unsaved changes</span>}
            </div>
            <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || saveStatus === 'saving' || !form.formState.isValid}>
              {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>) 
              : (<>{post ? <PenSquare className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} {post ? 'Update Post' : 'Publish'}</>)}
            </Button>
          </div>
        </form>

        {showAiAssistant && editor && (
          <AiAssistant
            onClose={() => setShowAiAssistant(false)}
            onSuggestion={handleAiSuggestion}
            currentContent={JSON.stringify(editorContent)} />
        )}

        {showImageUploader && (
          <ImageUploader
            onClose={() => setShowImageUploader(false)}
            onImageUploaded={handleFeaturedImageUploaded} />
        )}
      </Form>
    </>
  )
}