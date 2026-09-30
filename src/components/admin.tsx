"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconArrowUpRight,
  IconLayoutGrid,
  IconPhoto,
  IconCar,
  IconInbox,
  IconPlus,
  IconPencil,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconPhone,
  IconCheck,
  IconRefresh,
  IconMail,
  IconSearch,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import type { Service, Work, Inquiry } from "@/lib/types";
import { money } from "./work-grid";
import { Editor, type EditorState } from "./admin-editor";
import { AdminSidebar } from "./admin-sidebar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { NativeSelect } from "./ui/native-select";
import { Skeleton } from "./ui/skeleton";
import { Toaster } from "./ui/sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";

type Tab = "services" | "work" | "showroom" | "inbox";
type Confirmation = {
  title: string;
  description: string;
  label: string;
  destructive?: boolean;
  url: string;
  method: string;
  data?: unknown;
};
async function api(url: string, method = "GET", data?: unknown) {
  const response = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Unable to complete this action.");
  return result;
}
export function Admin() {
  const [tab, setTab] = useState<Tab>("services");
  const [services, setServices] = useState<Service[]>([]);
  const [work, setWork] = useState<Work[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [storage, setStorage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState("all");
  const actionLock = useRef(false);
  const actionOrigin = useRef<HTMLElement | null>(null);
  const refresh = useCallback(async () => {
    const [s, w, i, status] = await Promise.all([
      api("/api/services?admin=1"),
      api("/api/work?admin=1"),
      api("/api/inquiries"),
      api("/api/status"),
    ]);
    setServices(s.sort((a: Service, b: Service) => a.order - b.order));
    setWork(w);
    setInquiries(
      i.sort((a: Inquiry, b: Inquiry) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    );
    setStorage(status.storage);
  }, []);
  useEffect(() => {
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refresh]);
  async function reload() {
    setRefreshing(true);
    setError("");
    try {
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to refresh.");
    } finally {
      setRefreshing(false);
    }
  }
  async function mutate(url: string, method: string, data?: unknown) {
    if (actionLock.current)
      throw new Error("An action is already in progress.");
    actionLock.current = true;
    setBusy(true);
    setError("");
    try {
      await api(url, method, data);
      toast.success(method === "DELETE" ? "Item removed" : "Changes saved");
      try {
        await refresh();
      } catch {
        setError(
          "Your change was saved, but the list could not refresh. Refresh to see the latest content.",
        );
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to save.";
      setError(message);
      toast.error(message);
      throw e;
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  }
  function rememberFocus() {
    actionOrigin.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  }
  function restoreFocus() {
    requestAnimationFrame(() => {
      if (actionOrigin.current?.isConnected) actionOrigin.current.focus();
      else document.querySelector<HTMLElement>(".admin-heading h1")?.focus();
    });
  }
  function edit(state: EditorState) {
    rememberFocus();
    setEditor(state);
  }
  function confirm(action: Confirmation) {
    rememberFocus();
    setConfirmation(action);
  }
  function erase(
    kind: "services" | "work" | "inquiries",
    id: string,
    title: string,
  ) {
    confirm({
      title: `Delete ${title}?`,
      description:
        kind === "services"
          ? `This will permanently delete this service and all ${work.filter((w) => w.serviceId === id).length} items in its gallery. This cannot be undone.`
          : "This item will be permanently removed. This cannot be undone.",
      label: "Delete permanently",
      destructive: true,
      url: `/api/${kind}/${id}`,
      method: "DELETE",
    });
  }
  function visibility(kind: "services" | "work", item: Service | Work) {
    confirm({
      title: `${item.visible ? "Hide" : "Publish"} ${item.title}?`,
      description: item.visible
        ? `Visitors will no longer see this ${kind === "services" ? "service or its gallery" : "item"}. You can publish it again at any time.`
        : "This will be visible on your website when its parent service is also visible.",
      label: item.visible ? "Hide from website" : "Publish to website",
      url: `/api/${kind}/${item.id}`,
      method: "PATCH",
      data: { visible: !item.visible },
    });
  }
  const salesIds = new Set(
    services.filter((s) => s.type === "showroom").map((s) => s.id),
  );
  const visibleWork = work.filter(
    (w) =>
      (tab === "showroom"
        ? salesIds.has(w.serviceId)
        : !salesIds.has(w.serviceId)) &&
      (!filter || w.serviceId === filter),
  );
  const newCount = inquiries.filter((i) => i.status === "new").length;
  const visibleInquiries = inquiries.filter(
    (i) =>
      (inquiryStatus === "all" || i.status === inquiryStatus) &&
      `${i.name} ${i.phone} ${i.email} ${i.message} ${services.find((s) => s.id === i.serviceId)?.title || ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const tabs = [
    {
      id: "services" as Tab,
      label: "Services",
      icon: IconLayoutGrid,
      count: services.length,
    },
    {
      id: "work" as Tab,
      label: "Work galleries",
      icon: IconPhoto,
      count: work.filter((w) => !salesIds.has(w.serviceId)).length,
    },
    {
      id: "showroom" as Tab,
      label: "Showroom",
      icon: IconCar,
      count: work.filter((w) => salesIds.has(w.serviceId)).length,
    },
    {
      id: "inbox" as Tab,
      label: "Inquiries",
      icon: IconInbox,
      count: newCount,
    },
  ];
  const heading = tabs.find((t) => t.id === tab)!.label;
  return (
    <div className="admin-app admin-theme">
      <Toaster theme="dark" position="bottom-right" closeButton />
      <AdminSidebar>
        <Link className="admin-brand" href="/">
          <img src="/images/logo-white-edge.webp" alt="DRS" width="48" height="48" />
          <span>
            DR’S PAINT & BODY<small>Content manager</small>
          </span>
        </Link>
        <span className="admin-nav-label">Your workspace</span>
        <nav aria-label="CMS navigation">
          {tabs.map((item) => (
            <Button
              variant="ghost"
              key={item.id}
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => {
                setTab(item.id);
                setFilter("");
              }}
              className={tab === item.id ? "selected" : ""}
            >
              <div className="admin-navigation-icon">
                <item.icon size={20} />
              </div>
              <div className="admin-navigation-copy">
                <strong>{item.label}</strong>
                <small>
                  {
                    {
                      services: "Service pages & covers",
                      work: "Projects & photography",
                      showroom: "Vehicles & availability",
                      inbox: "Customer requests",
                    }[item.id]
                  }
                </small>
              </div>
              <span>{item.count}</span>
            </Button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span className="storage-status">
            <span className="connection-dot" />
            {loading
              ? "Connecting…"
              : storage === "neon"
                ? "Online workspace"
                : "Local workspace"}
          </span>
          <p>Manage the content visitors see.</p>
          <Button variant="outline" asChild>
            <Link href="/" target="_blank">
              View website
              <IconArrowUpRight size={17} />
            </Link>
          </Button>
        </div>
      </AdminSidebar>
      <main className="admin-main">
        <div className="admin-topbar">
          <span>
            Workspace <span className="breadcrumb-divider">/</span>
            <strong>{heading}</strong>
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh content"
            disabled={busy || refreshing || loading}
            onClick={reload}
          >
            <IconRefresh size={18} />
          </Button>
        </div>
        <div className="admin-content">
          <div className="admin-heading">
            <div>
              <p className="admin-eyebrow">Website content</p>
              <h1 tabIndex={-1}>{heading}</h1>
              <p>
                {tab === "services"
                  ? "Organize your services and choose what appears on your website."
                  : tab === "inbox"
                    ? "Review customer requests and track your follow-ups."
                    : "Manage your photos, listings, and what visitors see."}
              </p>
            </div>
            {tab !== "inbox" && (
              <Button
                disabled={
                  loading ||
                  busy ||
                  (tab !== "services" &&
                    !services.some((s) =>
                      tab === "showroom"
                        ? s.type === "showroom"
                        : s.type === "gallery",
                    ))
                }
                onClick={() =>
                  edit(
                    tab === "services" ? { kind: "service" } : { kind: "work" },
                  )
                }
              >
                <IconPlus size={17} />
                {tab === "services"
                  ? "Add service"
                  : tab === "showroom"
                    ? "Add vehicle"
                    : "Add work"}
              </Button>
            )}
          </div>
          {error && (
            <div className="admin-error" role="alert">
              <IconAlertTriangle size={18} />
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={refreshing || busy}
                onClick={reload}
              >
                Refresh
              </Button>
            </div>
          )}
          {loading ? (
            <div
              className="admin-loading"
              role="status"
              aria-label="Loading content"
            >
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {tab === "services" && (
                <div className="admin-service-list">
                  {services.map((service) => (
                    <Card className="admin-service-row" key={service.id}>
                      <div className="admin-thumb">
                        {service.coverImage ||
                        work.find((w) => w.serviceId === service.id)
                          ?.images[0] ? (
                          <img
                            src={
                              service.coverImage ||
                              work.find((w) => w.serviceId === service.id)!
                                .images[0]
                            }
                            alt=""
                            width="120"
                            height="85"
                          />
                        ) : (
                          <IconPhoto />
                        )}
                      </div>
                      <div className="admin-record-copy">
                        <h2>{service.title}</h2>
                        <p>{service.description}</p>
                        <span>
                          {
                            work.filter((w) => w.serviceId === service.id)
                              .length
                          }{" "}
                          items · /services/{service.slug}
                        </span>
                      </div>
                      <Status visible={service.visible} />
                      <div className="record-actions">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${service.title}`}
                          disabled={busy}
                          onClick={() =>
                            edit({ kind: "service", item: service })
                          }
                        >
                          <IconPencil size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busy}
                          aria-label={`${service.visible ? "Hide" : "Show"} ${service.title}`}
                          onClick={() => visibility("services", service)}
                        >
                          {service.visible ? (
                            <IconEye size={18} />
                          ) : (
                            <IconEyeOff size={18} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="delete-button"
                          disabled={busy}
                          aria-label={`Remove ${service.title}`}
                          onClick={() =>
                            erase("services", service.id, service.title)
                          }
                        >
                          <IconTrash size={18} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {!services.length && (
                    <AdminEmpty
                      title="Start with a service"
                      copy="Add a service, then upload your work to its gallery."
                    />
                  )}
                </div>
              )}
              {(tab === "work" || tab === "showroom") && (
                <>
                  <div className="admin-filter">
                    <label>
                      Filter by service
                      <NativeSelect
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="">
                          All {tab === "showroom" ? "showroom" : "gallery"}{" "}
                          services
                        </option>
                        {services
                          .filter((s) =>
                            tab === "showroom"
                              ? s.type === "showroom"
                              : s.type !== "showroom",
                          )
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                      </NativeSelect>
                    </label>
                    <span>{visibleWork.length} items</span>
                  </div>
                  <div className="admin-work-grid">
                    {visibleWork.map((item) => (
                      <Card key={item.id} className="admin-work-card">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          width="600"
                          height="400"
                          loading="lazy"
                        />
                        <CardContent className="admin-work-info">
                          <div className="admin-card-meta">
                            <span>
                              {
                                services.find((s) => s.id === item.serviceId)
                                  ?.title
                              }
                            </span>
                            <Status visible={item.visible} />
                          </div>
                          <h2>{item.title}</h2>
                          <p>
                            {tab === "showroom"
                              ? `${money(item.price)} · ${item.availability || "available"}`
                              : `${item.images.length} photo${item.images.length === 1 ? "" : "s"}`}
                            {item.demo ? " · Demo content" : ""}
                          </p>
                          {!services.find((s) => s.id === item.serviceId)
                            ?.visible && (
                            <p className="parent-hidden">
                              Parent service is hidden.
                            </p>
                          )}
                          <div className="admin-card-actions">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => edit({ kind: "work", item })}
                            >
                              <IconPencil size={16} />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={busy}
                              onClick={() => visibility("work", item)}
                            >
                              {item.visible ? (
                                <IconEyeOff size={16} />
                              ) : (
                                <IconEye size={16} />
                              )}
                              {item.visible ? "Hide" : "Show"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="delete-button"
                              disabled={busy}
                              aria-label={`Remove ${item.title}`}
                              onClick={() => erase("work", item.id, item.title)}
                            >
                              <IconTrash size={17} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {!visibleWork.length && (
                    <AdminEmpty
                      title={
                        tab === "showroom"
                          ? "Your showroom starts here"
                          : "Let your work do the talking"
                      }
                      copy="Add an item and upload photos. Hidden items stay in your CMS."
                    />
                  )}
                </>
              )}
              {tab === "inbox" && (
                <>
                  <div className="inquiry-summary">
                    <div>
                      <span className="summary-number">{newCount}</span>
                      <span>Awaiting follow-up</span>
                    </div>
                    <div>
                      <span className="summary-number">
                        {inquiries.length - newCount}
                      </span>
                      <span>Contacted</span>
                    </div>
                    <div>
                      <span className="summary-number">{inquiries.length}</span>
                      <span>Total requests</span>
                    </div>
                  </div>
                  <div className="inquiry-toolbar">
                    <div className="inquiry-search">
                      <IconSearch size={18} />
                      <Input
                        aria-label="Search inquiries"
                        placeholder="Search name, contact, or message…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <NativeSelect
                      aria-label="Filter inquiry status"
                      value={inquiryStatus}
                      onChange={(e) => setInquiryStatus(e.target.value)}
                    >
                      <option value="all">All requests</option>
                      <option value="new">Awaiting follow-up</option>
                      <option value="contacted">Contacted</option>
                    </NativeSelect>
                    <span role="status">
                      {visibleInquiries.length} requests
                    </span>
                  </div>
                  <div className="inquiry-list">
                    {visibleInquiries.map((item) => (
                      <Card
                        key={item.id}
                        className={`inquiry-card ${item.status === "new" ? "is-new" : ""}`}
                      >
                        <CardHeader className="inquiry-header">
                          <div className="inquiry-customer">
                            <span className="inquiry-avatar" aria-hidden>
                              {item.name
                                .trim()
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                            <div>
                              <h2>{item.name}</h2>
                              <p>
                                {services.find((s) => s.id === item.serviceId)
                                  ?.title || "Removed service"}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              item.status === "new"
                                ? "status-new"
                                : "status-contacted"
                            }
                          >
                            {item.status === "new" ? (
                              <IconClock size={13} />
                            ) : (
                              <IconCheck size={13} />
                            )}
                            {item.status === "new"
                              ? "Needs follow-up"
                              : "Contacted"}
                          </Badge>
                        </CardHeader>
                        <CardContent className="inquiry-body">
                          <p className="inquiry-message">
                            {item.message || "No message provided."}
                          </p>
                          <div className="inquiry-contact">
                            <a href={`tel:${item.phone}`}>
                              <IconPhone size={16} />
                              <span>{item.phone}</span>
                            </a>
                            {item.email && (
                              <a href={`mailto:${item.email}`}>
                                <IconMail size={16} />
                                <span>{item.email}</span>
                              </a>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="inquiry-footer">
                          <time dateTime={item.createdAt}>
                            {new Date(item.createdAt).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                              timeZone: "America/New_York",
                            })}{" "}
                            ET
                          </time>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() =>
                                mutate(`/api/inquiries/${item.id}`, "PATCH", {
                                  status:
                                    item.status === "new" ? "contacted" : "new",
                                }).catch(() => {})
                              }
                            >
                              {item.status === "new" ? (
                                <IconCheck size={16} />
                              ) : (
                                <IconRefresh size={16} />
                              )}
                              {item.status === "new"
                                ? "Mark contacted"
                                : "Mark new"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="delete-button"
                              disabled={busy}
                              aria-label={`Remove inquiry from ${item.name}`}
                              onClick={() =>
                                erase(
                                  "inquiries",
                                  item.id,
                                  `inquiry from ${item.name}`,
                                )
                              }
                            >
                              <IconTrash size={17} />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                    {!visibleInquiries.length && (
                      <AdminEmpty
                        title={
                          inquiries.length
                            ? "No matching requests"
                            : "All caught up"
                        }
                        copy={
                          inquiries.length
                            ? "Try a different search or status filter."
                            : "Customer requests will appear here with their contact details and message."
                        }
                      />
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
      {editor && (
        <Editor
          key={editor.item?.id || `new-${editor.kind}-${tab}`}
          state={editor}
          services={services}
          showroom={tab === "showroom"}
          busy={busy}
          serviceCover={
            editor.kind === "service"
              ? work.find((item) => item.serviceId === editor.item?.id)
                  ?.images[0]
              : undefined
          }
          servicePhotos={
            editor.kind === "service"
              ? [
                  ...new Set(
                    work
                      .filter((item) => item.serviceId === editor.item?.id)
                      .flatMap((item) => item.images),
                  ),
                ]
              : []
          }
          onClose={() => {
            setEditor(null);
            restoreFocus();
          }}
          onSave={async (data) => {
            await mutate(
              `/api/${editor.kind === "service" ? "services" : "work"}${editor.item ? `/${editor.item.id}` : ""}`,
              editor.item ? "PATCH" : "POST",
              data,
            );
            setEditor(null);
            restoreFocus();
          }}
        />
      )}
      <AlertDialog
        open={!!confirmation}
        onOpenChange={(open) => {
          if (!open && !busy) setConfirmation(null);
        }}
      >
        <AlertDialogContent
          className="admin-theme admin-confirmation"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <AlertDialogHeader>
            <span
              className={`confirmation-symbol ${confirmation?.destructive ? "danger" : ""}`}
            >
              {confirmation?.destructive ? (
                <IconTrash size={23} />
              ) : (
                <IconEye size={23} />
              )}
            </span>
            <AlertDialogTitle>{confirmation?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmation?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              className={confirmation?.destructive ? "destructive-action" : ""}
              onClick={async (event) => {
                event.preventDefault();
                if (!confirmation) return;
                try {
                  await mutate(
                    confirmation.url,
                    confirmation.method,
                    confirmation.data,
                  );
                  setConfirmation(null);
                } catch {}
              }}
            >
              {busy ? "Working…" : confirmation?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
function Status({ visible }: { visible: boolean }) {
  return (
    <Badge
      variant="outline"
      className={visible ? "status-visible" : "status-hidden"}
    >
      {visible ? "Published" : "Hidden"}
    </Badge>
  );
}
function AdminEmpty({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <IconInbox size={26} />
      </span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}
