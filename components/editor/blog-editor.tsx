"use client"

import * as React from "react"
import { useState, useEffect, useCallback, useRef } from "react" // Added useRef
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Editor, Node } from '@tiptap/core' // Import Editor and Node types

import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image as TiptapImage } from "@tiptap/extension-image" // Renamed to avoid conflict
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
  FormDescription, // Added for helper text
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { CodeIcon, DollarSign, Loader2, Save, Sparkles, Upload } from "lucide-react" // Added Upload icon

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
import { useWindowSize } from "@/hooks/use-window-size"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"
import { generateSlug } from "@/lib/utils" // Assuming you have a slug generation utility

// --- Styles ---
import "./simple-editor.scss"
import "@/styles/globals.css"

// --- Default Content (Optional) ---
import defaultContent from "./data/content"
import { AiAssistant } from "./ai-assistant"

// --- Feature Image Uploader Component ---
// (Assuming ImageUploader component provided in the prompt is in this path)
import { ImageUploader } from "./image-uploader" // Adjust path if needed
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X as XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  content: z.string().min(1, "Content is required"), // Keep this, but content comes from editor
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  organizationId: z.string().min(1, "Organization ID is required."),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),

})

// --- Toolbar Components (Keep as is - no changes needed) ---
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
        <ImageUploadButton />
        {!isMobile ? <EmbedPopover /> : <EmbedButton onClick={onEmbedClick} />}
        {!isMobile ? <AdPlaceholderPopover /> : <AdPlaceholderButton onClick={onAdPlaceholderClick} />}
      </ToolbarGroup>
      <ToolbarGroup>
        <Button type="button" onClick={() => setShowAiAssistant(true)} aria-label="AI Assistant">
          <Sparkles className="h-4 w-4" />
        </Button>
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
  post?: any; // For editing a published post
  drafts?: any[]; // For creating a new post
  organizationPlan: typeof PLAN_LIMITS;
}) {

  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMobile = useMobile()
  const windowSize = useWindowSize()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link" | "embed" | "ad-placeholder"
  >("main")
  const [rect, setRect] = React.useState({ y: 0 })
  const [editorContent, setEditorContent] = useState<any>(post?.content || defaultContent)
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [showImageUploader, setShowImageUploader] = useState(false); // <-- State for Image Uploader Modal
  const isSlugManuallyEdited = useRef(false); // <-- Ref to track manual slug edits

  // --- NEW: State for auto-saving and drafts ---
  const [isDraftDialogOpen, setIsDraftDialogOpen] = useState(drafts && drafts.length > 0 && !post);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(post?.id || null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  // --- NEW: State for categories and tags ---
  const [categories, setCategories] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const planLimits = PLAN_LIMITS[organizationPlan]; // You'll need to pass the org's plan to the editor
  const [isPublishedVersion, setIsPublishedVersion] = useState(!!post); // Is this an edit of a live post?


  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
      const response = await fetch('/api/organizations/categories');
      if (response.ok) setCategories(await response.json());
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
        form.setValue('tags', newTags, { shouldDirty: true });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue('tags', newTags, { shouldDirty: true });
  };

  // --- Function to find first H1 and its text ---
  const findFirstH1Text = (editorInstance: Editor): string | null => {
    let firstH1Text: string | null = null;
    editorInstance.state.doc.forEach((node) => {
      if (!firstH1Text && node.type.name === 'heading' && node.attrs.level === 1) {
        firstH1Text = node.textContent.trim()
      }
    })
    return firstH1Text
  }

  // --- React Hook Form Setup ---
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      id: post?.id,
      title: post?.title || "", // Will be potentially overwritten by H1
      slug: post?.slug || "",   // Will be potentially overwritten by H1->Title
      excerpt: post?.excerpt || "",
      featuredImage: post?.featuredImage || "",
      metaTitle: post?.metaTitle || post?.title || "",
      metaDescription: post?.metaDescription || post?.excerpt || "",
      content: post?.content || defaultContent,
      organizationId: post?.organizationId || organizationId,
    },
    mode: 'onChange', // Needed for isDirty state to update promptly
  })

  // --- Tiptap Editor Instance ---
  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none p-4 min-h-[300px]", // Added padding & min-height
        "aria-label": "Main content area, start typing to enter text.",
      },
    },
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }), // Ensure H1 is enabled
      Placeholder.configure({ placeholder: 'Start with a Heading 1 for your title...' }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      TiptapImage, // Use renamed import
      Iframe,
      AdPlaceholder,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 5,
        upload: handleImageUpload,
        onError: (error) => {
          console.error("Upload failed:", error)
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
    content: editorContent, // Use state derived from props/default
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      const jsonContent = editor.getJSON();
      setEditorContent(jsonContent); // For AI Assistant
      form.setValue("content", htmlContent, { shouldValidate: true, shouldDirty: true });

      // --- Auto-update Title from H1 ---
      const firstH1 = findFirstH1Text(editor);
      if (firstH1 !== null) {
        const currentTitle = form.getValues("title");
        if (firstH1 !== currentTitle) {
          form.setValue("title", firstH1, { shouldValidate: true, shouldDirty: true });
          // Reset slug manual edit flag only if title changes *programmatically*
          // This allows the slug useEffect to take over if it wasn't manually changed
          if (!form.formState.dirtyFields.slug) {
            isSlugManuallyEdited.current = false;
          }
        }
      } else {
        // Optional: Clear title if H1 is removed? Or keep the last known title?
        // Decide based on desired UX. Let's keep it for now unless explicitly cleared.
        // if (form.getValues("title")) {
        //    form.setValue("title", "", { shouldValidate: true, shouldDirty: true });
        //    isSlugManuallyEdited.current = false; // Reset if title becomes empty
        // }
      }
    },
  })



  // --- NEW: True Inactivity-Based Auto-Save Logic ---
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const watchedFormData = form.watch(); // Watch for any changes

  const handleAutoSave = useCallback(async () => {
    // This function now contains the actual save logic
    setSaveStatus('saving');

    const currentValues = form.getValues();
    const content = editor?.getHTML() || currentValues.content;

    // A light validation before saving
    if (!currentValues.title || content.length < 10) {
      setSaveStatus('idle');
      return;
    }

    try {
      let savedDraft;
      const payload = { ...currentValues, content, organizationId };

      if (currentDraftId) {
        // Update existing draft
        const response = await fetch(`/api/drafts/${currentDraftId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to save draft.");
        savedDraft = await response.json();
      } else {
        // Create new draft
        const response = await fetch('/api/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload }),
        });
        if (!response.ok) throw new Error("Failed to create draft.");
        savedDraft = await response.json();
        setCurrentDraftId(savedDraft.id);
        router.replace(`/dashboard/editor/${savedDraft.id}`, { scroll: false });
      }

      setSaveStatus('saved');
      setLastSaved(new Date(savedDraft.updatedAt));
      // CRITICAL: Reset the form's default values to the saved state.
      // This marks the form as "not dirty" until the next user edit.
      form.reset(savedDraft);

    } catch (error) {
      setSaveStatus('error');
      console.error("Auto-save failed:", error);
    }
  }, [editor, form, currentDraftId, organizationId, router]);

  useEffect(() => {
    // This effect listens for changes and sets up the debounced save.

    // Only trigger auto-save if the form has been modified by the user.
    if (form.formState.isDirty) {
      // If a timer is already running, clear it. This is the debounce.
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      // Set a new timer to call the save function after 3 seconds of inactivity.
      autoSaveTimer.current = setTimeout(() => {
        handleAutoSave();
      }, 3000); // 3-second delay
    }

    // Cleanup function to clear the timer if the component unmounts
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [watchedFormData, form.formState.isDirty, handleAutoSave]);


  // --- Final Publish/Update Logic ---
  async function onSubmit(values: z.infer<typeof postSchema>) {
    // Before publishing, ensure any last-minute changes are saved.
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    // Awaiting here ensures the final content is saved before publishing.
    await handleAutoSave();

    setIsSubmitting(true);
    try {
      const finalDraftId = currentDraftId || post?.id;
      if (!finalDraftId) throw new Error("No draft to publish.");
      const response = await fetch(`/api/posts/${currentDraftId}/publish`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error("Failed to publish post.");

      toast({ title: "Post Published!", description: "Your post is now live." });
      router.push('/dashboard/posts');
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error Publishing", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Handler for Draft Selection Dialog ---
  const handleSelectDraft = (draft: any) => {
    form.reset(draft);
    if (editor) editor.commands.setContent(draft.content);
    setCurrentDraftId(draft.id);
    setLastSaved(new Date(draft.updatedAt));
    // Update URL to the draft's edit page
    router.replace(`/dashboard/editor/${draft.id}`, { scroll: false });
    setIsDraftDialogOpen(false);
  }

  // --- Effect to auto-generate Slug from Title ---
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'title' && value.title) {
        // Only update slug if it hasn't been manually edited *since the last title change*
        if (!isSlugManuallyEdited.current) {
          const newSlug = generateSlug(value.title); // Use your utility function
          if (newSlug !== form.getValues('slug')) {
            form.setValue("slug", newSlug, { shouldValidate: true, shouldDirty: true });
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isSlugManuallyEdited]); // Watch form, ref doesn't trigger re-run but is accessible

  // --- Effect to set initial title/slug from loaded content ---
  useEffect(() => {
    if (editor && !form.formState.isDirty) { // Only on initial load or reset
      const initialContent = form.getValues('content');
      // Need to temporarily set content to parse it if editor loaded with default/empty
      if (initialContent && editor.isEmpty) {
        editor.commands.setContent(initialContent, false);
      }

      const initialH1 = findFirstH1Text(editor);
      const currentTitle = form.getValues('title');
      const currentSlug = form.getValues('slug');

      if (initialH1 && (!currentTitle || post?.title === currentTitle)) { // Update if title is empty or matches original post prop title
        form.setValue('title', initialH1, { shouldDirty: !!post?.id }); // Mark dirty only if editing
        if (!currentSlug || post?.slug === currentSlug) { // Update slug only if empty or matches original
          form.setValue('slug', generateSlug(initialH1), { shouldDirty: !!post?.id });
          isSlugManuallyEdited.current = false; // Reset slug flag
        }
      }
      // Set initial meta fields if empty
      const currentMetaTitle = form.getValues('metaTitle');
      const currentMetaDesc = form.getValues('metaDescription');
      const currentExcerpt = form.getValues('excerpt');

      if (!currentMetaTitle && initialH1) {
        form.setValue('metaTitle', initialH1, { shouldDirty: !!post?.id });
      }
      if (!currentMetaDesc && currentExcerpt) {
        form.setValue('metaDescription', currentExcerpt, { shouldDirty: !!post?.id });
      }

    }
  }, [editor, form, post]); // Re-run if editor instance changes


  const handleAiSuggestion = useCallback(
    (suggestion: any) => {
      if (editor && suggestion) {
        console.log("AI suggestion:", suggestion);
        // Use JSON for better structure preservation if suggestion is JSON
        const isJson = typeof suggestion === 'object';
        editor.commands.setContent(suggestion, false);
        // Re-trigger title/slug update after AI content sets
        const newH1 = findFirstH1Text(editor);
        if (newH1) {
          form.setValue('title', newH1, { shouldValidate: true, shouldDirty: true });
          // Only auto-slug if not manually edited
          if (!isSlugManuallyEdited.current) {
            form.setValue('slug', generateSlug(newH1), { shouldValidate: true, shouldDirty: true });
          }
        }
        form.setValue('content', isJson ? editor.getHTML() : suggestion, { shouldValidate: true, shouldDirty: true });
      }
    },
    [editor, form],
  )

  // --- Mobile Toolbar Positioning ---
  React.useEffect(() => {
    setRect(document.body.getBoundingClientRect())
  }, [])

  // --- Reset Mobile View on Resize ---
  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  // --- Handle Featured Image Upload ---
  const handleFeaturedImageUploaded = (url: string) => {
    form.setValue("featuredImage", url, { shouldValidate: true, shouldDirty: true });
    setShowImageUploader(false); // Close modal on success
  };

  // Render loading or null if editor isn't ready
  if (!editor) {
    return <div className="p-4 text-center">Loading editor...</div>
  }

  return (
    <>
      <Dialog open={isDraftDialogOpen} onOpenChange={setIsDraftDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Continue Your Work</DialogTitle><DialogDescription>You have unpublished drafts. Choose one to continue editing or start a new post.</DialogDescription></DialogHeader>
          <div className="space-y-2 py-4">
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
          {/* --- Top Level Fields --- */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormDescription>Automatically updated from the first H1 in the editor.</FormDescription>
                  <FormControl>
                    {/* Title is read-only or visually disabled as it's auto-populated */}
                    <Input placeholder="Auto-generated from editor H1" {...field} className="bg-muted/50 border-dashed" />
                  </FormControl>
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
                        // Set flag on manual change
                        isSlugManuallyEdited.current = true
                        field.onChange(e) // Propagate change to RHF
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
                <FormControl>
                  <Textarea placeholder="A short summary for previews and meta description fallback" {...field} rows={3} />
                </FormControl>
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
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    onClick={() => setShowImageUploader(true)}
                    aria-label="Upload Featured Image"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>Enter a URL directly or upload an image.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

          <Separator />

          {/* --- NEW: Category and Tag Fields --- */}
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormDescription>Group this post under a specific category.</FormDescription>
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Tags / Keywords</FormLabel>
              <div className="flex items-center flex-wrap gap-2 rounded-md border">
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
                  className="flex-1 border-none shadow-none focus-visible:ring-0"
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

          {/* --- Tiptap Editor and Toolbar --- */}
          <EditorContext.Provider value={{ editor }}>
            <Toolbar
              style={isMobile
                ? {
                  position: 'sticky',
                  top: '0', // Adjust based on your header height if necessary
                  zIndex: 10,
                  backgroundColor: 'hsl(var(--background))', // Add background to prevent content showing through
                  borderBottom: '1px solid hsl(var(--border))', // Add separator
                }
                : { position: 'sticky', top: '0', zIndex: 10, overflowX: 'auto', backgroundColor: 'hsl(var(--background))', borderBottom: '1px solid hsl(var(--border))' }}
              className="custom-toolbar-scroll"
            >
              {/* Toolbar Content (MainToolbarContent / MobileToolbarContent) */}
              {mobileView === "main" ? (
                <MainToolbarContent
                  onEmbedClick={() => setMobileView("embed")}
                  onAdPlaceholderClick={() => setMobileView("ad-placeholder")}
                  onHighlighterClick={() => setMobileView("highlighter")}
                  onLinkClick={() => setMobileView("link")}
                  isMobile={isMobile}
                  setShowAiAssistant={setShowAiAssistant} />
              ) : (
                <MobileToolbarContent
                  type={mobileView}
                  onBack={() => setMobileView("main")} />
              )}
            </Toolbar>

            {/* Added border and bg for better visual separation */}
            <div className="content-wrapper mt-2 rounded-md border bg-background shadow-sm">
              <EditorContent
                editor={editor}
                role="presentation"
                className="simple-editor-content" // Ensure this class provides padding if not using prose p-4 above
              />
            </div>

          </EditorContext.Provider>

          <Separator />

          {/* --- SEO Fields --- */}
          <h2 className="text-lg font-semibold">SEO Settings (Optional)</h2>
          <div className="space-y-4 rounded-md border p-4">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input placeholder="SEO Title (defaults to post title)" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Textarea placeholder="SEO Description (defaults to excerpt)" {...field} rows={3} />
                  </FormControl>
                  <FormDescription>Recommended length: 150-160 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
          </div>

          <Separator />

          {/* --- Action Buttons --- */}
          {/* --- Action Buttons with Save Status --- */}
          <div className="flex items-center justify-end space-x-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {saveStatus === 'saving' && <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>}
              {saveStatus === 'saved' && lastSaved && <><Clock className="h-4 w-4" /> Last saved {format(lastSaved, "h:mm:ss a")}</>}
              {saveStatus === 'error' && <span className="text-destructive">Save failed</span>}
            </div>
            <Button type="button" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : <><Save className="mr-2 h-4 w-4" /> {post ? 'Update Post' : 'Publish'}</>}
            </Button>
          </div>
        </form>

        {/* AI Assistant Modal */}
        {showAiAssistant && editor && ( // Ensure editor is available
          <AiAssistant
            onClose={() => setShowAiAssistant(false)}
            onSuggestion={handleAiSuggestion}
            currentContent={JSON.stringify(editorContent)} // Pass current JSON content
          />
        )}

        {/* Feature Image Uploader Modal */}
        {showImageUploader && (
          <ImageUploader
            onClose={() => setShowImageUploader(false)}
            onImageUploaded={handleFeaturedImageUploaded} />
        )}
      </Form>
    </>
  )
}