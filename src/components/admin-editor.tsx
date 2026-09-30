"use client";
import { useRef, useState } from "react";
import { IconX, IconUpload, IconCheck } from "@tabler/icons-react";
import type { Service, Work } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  EditorModal as Dialog,
  EditorModalContent as DialogContent,
  EditorModalTitle as DialogTitle,
  EditorModalDescription as DialogDescription,
} from "./responsive-editor";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
export type EditorState =
  { kind: "service"; item?: Service } | { kind: "work"; item?: Work };
export function Editor({
  state,
  services,
  showroom,
  busy,
  serviceCover,
  servicePhotos = [],
  onClose,
  onSave,
}: {
  state: EditorState;
  services: Service[];
  showroom: boolean;
  busy: boolean;
  serviceCover?: string;
  servicePhotos?: string[];
  onClose: () => void;
  onSave: (data: unknown) => Promise<void>;
}) {
  const work = state.kind === "work" ? state.item : undefined;
  const service = state.kind === "service" ? state.item : undefined;
  const [serviceId, setServiceId] = useState(
    work?.serviceId ||
      services.find((s) =>
        showroom ? s.type === "showroom" : s.type === "gallery",
      )?.id ||
      services[0]?.id ||
      "",
  );
  const [images, setImages] = useState(work?.images || []);
  const [coverImage, setCoverImage] = useState(service?.coverImage || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [demo, setDemo] = useState(work?.demo || false);
  const isVehicle =
    services.find((s) => s.id === serviceId)?.type === "showroom";
  const newServiceSlug = useRef<HTMLInputElement>(null);

  async function uploadCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      if (file.size > 4 * 1024 * 1024)
        throw new Error("Photos must be smaller than 4 MB.");
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/media", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to upload this photo.");
      setCoverImage(data.url);
      setDirty(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (images.length + files.length > 8) {
      setError("Use up to 8 photos per item.");
      return;
    }
    setUploading(true);
    setError("");
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/media", {
          method: "POST",
          body: form,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        uploaded.push(data.url);
      }
      setDemo(false);
      setDirty(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setImages((current) => [...current, ...uploaded]);
      setUploading(false);
      event.target.value = "";
    }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (state.kind === "service")
        await onSave({
          ...form,
          visible: form.visible === "on",
          order: Number(form.order),
          coverImage,
        });
      else {
        if (!images.length) throw new Error("Upload at least one photo.");
        await onSave({
          title: form.title,
          description: form.description,
          serviceId,
          images,
          customerLabel: String(form.customerLabel || ""),
          vehicle: String(form.vehicle || ""),
          visible: form.visible === "on",
          demo,
          ...(isVehicle
            ? {
                year: form.year ? Number(form.year) : undefined,
                price: form.price ? Number(form.price) : undefined,
                mileage: form.mileage ? Number(form.mileage) : undefined,
                availability: form.availability,
              }
            : {}),
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save.");
    }
  }
  function close() {
    if (busy || uploading) return;
    if (dirty) setDiscard(true);
    else onClose();
  }
  return (
    <>
      <Dialog
        open
        locked={busy || uploading}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent
          className="admin-theme editor-dialog"
          showCloseButton={false}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            document
              .querySelector<HTMLInputElement>(
                '.editor-form input[name="title"]',
              )
              ?.focus();
          }}
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            close();
          }}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className="editor-dialog-heading">
            <div>
              <DialogTitle>
                {state.item ? "Edit" : "Add"}{" "}
                {state.kind === "service"
                  ? "service"
                  : isVehicle
                    ? "vehicle"
                    : "work"}
              </DialogTitle>
              <DialogDescription>
                {state.kind === "service"
                  ? "Choose what visitors see on your website."
                  : "Keep all photos for one customer project together. The first photo is the cover."}
              </DialogDescription>
            </div>
            <Button
              className="icon-button"
              disabled={busy || uploading}
              aria-label="Close editor"
              onClick={close}
            >
              <IconX />
            </Button>
          </div>
          <form
            onSubmit={submit}
            onChange={() => setDirty(true)}
            className="editor-form"
          >
            {state.kind === "service" && (
              <section className="service-cover-editor">
                <div className="service-cover-preview">
                  <div>
                    {coverImage || serviceCover ? (
                      <img
                        src={coverImage || serviceCover}
                        alt={`${service?.title || "Service"} cover`}
                        width="160"
                        height="110"
                      />
                    ) : (
                      <IconUpload size={24} />
                    )}
                  </div>
                  <section>
                    <h3>Service cover photo</h3>
                    <p>
                      {coverImage
                        ? "Custom cover. Save changes to publish your selection."
                        : "Uses the first gallery photo until you choose a custom cover."}
                    </p>
                  </section>
                </div>
                <div className="service-cover-controls">
                  <label className="upload-button">
                    <IconUpload size={17} />
                    {uploading ? "Uploading…" : "Upload cover photo"}
                    <Input
                      aria-label="Upload service cover photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={busy || uploading}
                      onChange={uploadCover}
                    />
                  </label>
                  {coverImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busy || uploading}
                      onClick={() => {
                        setCoverImage("");
                        setDirty(true);
                      }}
                    >
                      Use gallery cover
                    </Button>
                  )}
                </div>
                {!!servicePhotos.length && (
                  <>
                    <p className="form-helper">
                      Or choose a photo already in this gallery
                    </p>
                    <div className="service-photo-picker">
                      {servicePhotos.map((src, index) => (
                        <Button
                          key={src}
                          type="button"
                          variant="ghost"
                          disabled={busy || uploading}
                          aria-label={`Use gallery photo ${index + 1} as cover`}
                          aria-pressed={coverImage === src}
                          onClick={() => {
                            setCoverImage(src);
                            setDirty(true);
                          }}
                        >
                          <img
                            src={src}
                            alt={`Gallery photo ${index + 1}`}
                            width="100"
                            height="72"
                          />
                        </Button>
                      ))}
                    </div>
                  </>
                )}
                <p className="form-helper">
                  JPG, PNG, or WebP · up to 4 MB. Photos are optimized and saved
                  in your database.
                </p>
              </section>
            )}
            <fieldset disabled={busy || uploading} className="editor-fields">
              <label>
                {state.kind === "service" ? "Service name" : "Title"}
                <Input
                  name="title"
                  required
                  maxLength={state.kind === "service" ? 80 : 120}
                  defaultValue={service?.title || work?.title || ""}
                  onChange={(event) => {
                    if (
                      state.kind === "service" &&
                      !service &&
                      newServiceSlug.current
                    )
                      newServiceSlug.current.value = event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "");
                  }}
                  placeholder={
                    state.kind === "service"
                      ? "e.g. Autobody"
                      : "e.g. Front bumper restoration"
                  }
                />
              </label>
              {state.kind === "service" ? (
                <>
                  <label>
                    Page URL
                    <Input
                      name="slug"
                      ref={newServiceSlug}
                      defaultValue={service?.slug || ""}
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      required
                      maxLength={80}
                      placeholder="e.g. collision-repair"
                    />
                    <span className="form-helper">
                      Lowercase letters, numbers, and hyphens only.
                    </span>
                  </label>
                  <div className="form-row">
                    <label>
                      Service type
                      <NativeSelect
                        name="type"
                        defaultValue={service?.type || "gallery"}
                      >
                        <option value="gallery">Work gallery</option>
                        <option value="showroom">Vehicle showroom</option>
                      </NativeSelect>
                    </label>
                    <label>
                      Display order
                      <Input
                        name="order"
                        type="number"
                        min="0"
                        max="999"
                        step="1"
                        required
                        defaultValue={service?.order ?? services.length}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label>
                  Service
                  <NativeSelect
                    value={serviceId}
                    onChange={(event) => setServiceId(event.target.value)}
                    required
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                        {s.visible ? "" : " (hidden)"}
                      </option>
                    ))}
                  </NativeSelect>
                </label>
              )}
              {state.kind === "work" && !isVehicle && (
                <div className="form-row">
                  <label>
                    Customer label (optional)
                    <Input
                      name="customerLabel"
                      maxLength={100}
                      defaultValue={work?.customerLabel || ""}
                      placeholder="e.g. Customer 01"
                    />
                    <span className="form-helper">
                      Shown publicly. An anonymous label is fine.
                    </span>
                  </label>
                  <label>
                    Vehicle (optional)
                    <Input
                      name="vehicle"
                      maxLength={120}
                      defaultValue={work?.vehicle || ""}
                      placeholder="e.g. Silver sedan"
                    />
                  </label>
                </div>
              )}
              <label>
                Description
                <Textarea
                  name="description"
                  rows={3}
                  required={state.kind === "service"}
                  maxLength={state.kind === "service" ? 1000 : 2000}
                  defaultValue={service?.description || work?.description || ""}
                  placeholder="A short description..."
                />
              </label>
              {state.kind === "work" && (
                <>
                  <div className="photo-editor">
                    <span className="field-label">
                      Photos ({images.length}/8)
                    </span>
                    <div className="photo-thumbnails">
                      {images.map((src, index) => (
                        <div key={`${src}-${index}`}>
                          <img
                            src={src}
                            alt={`Photo ${index + 1}`}
                            width="120"
                            height="90"
                          />
                          <Button
                            type="button"
                            disabled={uploading || busy}
                            aria-label={`Remove photo ${index + 1}`}
                            onClick={() => {
                              setDirty(true);
                              setImages((current) =>
                                current.filter((_, i) => i !== index),
                              );
                            }}
                          >
                            <IconX size={15} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <label className="upload-button">
                      <IconUpload size={19} />
                      {uploading ? "Uploading photos..." : "Upload photos"}
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={uploading || busy || images.length >= 8}
                        onChange={upload}
                      />
                    </label>
                    <p className="form-helper">
                      JPG, PNG, or WebP. Up to 4 MB each. Photos are optimized
                      automatically.
                    </p>
                  </div>
                  {isVehicle && (
                    <>
                      <div className="form-row">
                        <label>
                          Year
                          <Input
                            name="year"
                            type="number"
                            min="1900"
                            max="2100"
                            step="1"
                            defaultValue={work?.year}
                          />
                        </label>
                        <label>
                          Price (USD)
                          <Input
                            name="price"
                            type="number"
                            min="0"
                            max="10000000"
                            step="1"
                            defaultValue={work?.price}
                          />
                        </label>
                      </div>
                      <div className="form-row">
                        <label>
                          Mileage
                          <Input
                            name="mileage"
                            type="number"
                            min="0"
                            max="10000000"
                            step="1"
                            defaultValue={work?.mileage}
                          />
                        </label>
                        <label>
                          Availability
                          <NativeSelect
                            name="availability"
                            defaultValue={work?.availability || "available"}
                          >
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                          </NativeSelect>
                        </label>
                      </div>
                    </>
                  )}
                  <label className="checkbox-label">
                    <Checkbox
                      checked={demo}
                      onCheckedChange={(value) => {
                        setDemo(value === true);
                        setDirty(true);
                      }}
                    />
                    Label as illustrative demo content
                  </label>
                </>
              )}
              <label className="checkbox-label">
                <Checkbox
                  name="visible"
                  defaultChecked={state.item?.visible ?? true}
                  onCheckedChange={() => setDirty(true)}
                />
                Visible on website
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
            </fieldset>
            <div className="editor-actions">
              <Button
                variant="outline"
                type="button"
                onClick={close}
                disabled={busy || uploading}
              >
                Cancel
              </Button>
              <Button disabled={busy || uploading}>
                {busy ? "Saving..." : "Save changes"}
                <IconCheck size={18} />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={discard} onOpenChange={setDiscard}>
        <AlertDialogContent
          className="admin-theme"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            document
              .querySelector<HTMLInputElement>(
                '.editor-form input[name="title"]',
              )
              ?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your edits have not been saved. Keep editing to finish, or discard
              them to close the editor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={onClose} className="destructive-action">
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
