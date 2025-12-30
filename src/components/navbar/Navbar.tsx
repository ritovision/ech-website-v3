"use client";

import type { Nav } from "@/types";
import { nav } from "@/constants/nav";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CgArrowLeft, CgClose } from "react-icons/cg";
import { IoMenuOutline } from "react-icons/io5";

const isExternalLink = (link?: string) =>
  Boolean(link && /^https?:\/\//.test(link));

export default function Navbar() {
  const path = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [panel, setPanel] = useState<"root" | "child">("root");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement | null>(null);
  const lastScrollYRef = useRef(0);

  const activeItem = activeIndex !== null ? nav[activeIndex] : null;
  const activeChildren = activeItem?.children ?? [];

  const resetPanels = useCallback(() => {
    setPanel("root");
    setActiveIndex(null);
  }, []);

  const openSection = useCallback(
    (index: number) => {
      setActiveIndex(index);
      setPanel("child");
    },
    []
  );

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    resetPanels();
  }, [resetPanels]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsMenuOpen(open);
      if (!open) {
        resetPanels();
      }
    },
    [resetPanels]
  );

  useEffect(() => {
    resetPanels();
    setIsMenuOpen(false);
  }, [path, resetPanels]);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.getBoundingClientRect().height);
      }
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = (event?: Event) => {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(() => {
        const target = event?.target as HTMLElement | Document | null;
        const isElementTarget =
          target &&
          target !== document &&
          target !== document.documentElement &&
          target !== document.body;
        const targetScrollTop =
          isElementTarget && "scrollTop" in target ? target.scrollTop : 0;
        const docScrollTop =
          document.scrollingElement?.scrollTop ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
        const windowScrollTop = window.scrollY || 0;
        const currentY = targetScrollTop || docScrollTop || windowScrollTop;
        const delta = currentY - lastScrollYRef.current;

        setIsScrolled(currentY > 0);

        if (currentY <= headerHeight) {
          setIsHidden(false);
        } else if (delta > 0) {
          setIsHidden(true);
        } else if (delta < -8) {
          setIsHidden(false);
        }

        lastScrollYRef.current = currentY;
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [headerHeight]);

  const NavLink = ({
    item,
    className,
    activeClassName,
    inactiveClassName,
    onNavigate,
  }: {
    item: Nav;
    className?: string;
    activeClassName: string;
    inactiveClassName: string;
    onNavigate?: () => void;
  }) => {
    const href = item.link || "/";
    const external = isExternalLink(href);
    const active = !external && path === href;
    const classes = cn(
      "block font-antonio transition-colors duration-200",
      active ? activeClassName : inactiveClassName,
      className
    );

    const content = external ? (
      <a href={href} className={classes} onClick={onNavigate}>
        {item.label.toUpperCase()}
      </a>
    ) : (
      <Link
        href={href}
        className={classes}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
      >
        {item.label.toUpperCase()}
      </Link>
    );

    return content;
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 z-50 flex w-full items-center justify-between bg-white md:px-16 px-8 md:py-6 py-4 transition-all duration-300",
        isHidden ? "-translate-y-full" : "translate-y-0",
        isScrolled ? "shadow-xl shadow-lightGray/30" : "shadow-none"
      )}
    >
      <Link href="/" aria-label="Home">
        <Image
          src="/assets/ech_horizontal_logo.svg"
          alt="ech_logo"
          height={100}
          width={100}
          className="md:scale-100 scale-75"
        />
      </Link>

      <nav className="hidden xl:flex gap-x-16 items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {nav.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          if (hasChildren) {
            return (
              <DesktopNavPopover
                key={item.label}
                item={item}
                renderLink={(linkItem, className) => (
                  <NavLink
                    item={linkItem}
                    className={className}
                    activeClassName="text-white"
                    inactiveClassName="text-white/70 hover:text-white"
                  />
                )}
              />
            );
          }

          return (
            <NavLink
              key={item.label}
              item={item}
              className="text-3xl"
              activeClassName="text-black"
              inactiveClassName="text-lightGray hover:text-black"
            />
          );
        })}
      </nav>

      <Dialog open={isMenuOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="hover:cursor-pointer xl:hidden"
            aria-label="Open menu"
          >
            <IoMenuOutline size={50} />
          </button>
        </DialogTrigger>

        <DialogPortal>
          <DialogOverlay className="z-[60] bg-black/90" />
          <DialogPrimitive.Content className="fixed inset-0 z-[70] flex h-full flex-col bg-transparent text-white">
            <DialogTitle className="sr-only">Main menu</DialogTitle>
            <div className="flex items-center justify-between md:pt-6 pt-4 md:px-16 px-8">
              <Link href="/" aria-label="Home" onClick={closeMenu}>
                <Image
                  src="/assets/ech_horizontal_logo.svg"
                  alt="ech_logo"
                  height={100}
                  width={100}
                  className="md:scale-100 scale-75"
                />
              </Link>
              <DialogClose asChild>
                <button type="button" aria-label="Close menu">
                  <CgClose size={50} />
                </button>
              </DialogClose>
            </div>

            <div className="relative flex-1 overflow-hidden">
              <div className="relative h-full">
                  {panel === "root" && (
                    <div
                      className={cn(
                        "absolute inset-0 overflow-y-auto px-10 pb-10 min-[1000px]:pl-[10%] animate-in fade-in-0 duration-500"
                      )}
                    >
                      <div className="flex flex-col gap-8 text-5xl">
                        {nav.map((item, index) => (
                          <div key={item.label}>
                            {item.children && item.children.length > 0 ? (
                              <button
                                type="button"
                                className="text-5xl font-antonio text-white"
                                onClick={() => openSection(index)}
                              >
                                {item.label.toUpperCase()}
                              </button>
                            ) : (
                              <NavLink
                                item={item}
                                className="text-5xl"
                                onNavigate={closeMenu}
                                activeClassName="text-white"
                                inactiveClassName="text-white/70 hover:text-white"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {panel === "child" && (
                    <div
                      className={cn(
                        "absolute inset-0 overflow-y-auto px-10 pb-10 min-[1000px]:pl-[10%] animate-in fade-in-0 duration-500"
                      )}
                    >
                      <div className="flex items-center gap-4 pb-6">
                        <button
                          type="button"
                          onClick={() => setPanel("root")}
                          aria-label="Back"
                          className="rounded-full border-4 border-white p-2"
                        >
                          <CgArrowLeft size={32} />
                        </button>
                        <p className="text-3xl font-antonio">
                          {activeItem?.label.toUpperCase()}
                        </p>
                      </div>

                      <Accordion type="multiple" className="flex flex-col gap-4">
                        {activeChildren.map((item, index) => {
                          if (item.children && item.children.length > 0) {
                            return (
                              <AccordionItem
                                key={item.label}
                                value={`${item.label}-${index}`}
                                className="border-none"
                              >
                                <AccordionTrigger className="text-3xl font-antonio text-white hover:no-underline">
                                  {item.label.toUpperCase()}
                                </AccordionTrigger>
                                <AccordionContent className="mt-2 space-y-2 border-l-2 border-white/20 pl-6">
                                  {item.children.map((subItem, subIndex) => (
                                    <div key={`${subItem.label}-${subIndex}`}>
                                      <NavLink
                                        item={subItem}
                                        className="text-2xl"
                                        onNavigate={closeMenu}
                                        activeClassName="text-white"
                                        inactiveClassName="text-white/70 hover:text-white"
                                      />
                                    </div>
                                  ))}
                                </AccordionContent>
                              </AccordionItem>
                            );
                          }

                          return (
                            <div key={item.label}>
                              <NavLink
                                item={item}
                                className="text-3xl"
                                onNavigate={closeMenu}
                                activeClassName="text-white"
                                inactiveClassName="text-white/70 hover:text-white"
                              />
                            </div>
                          );
                        })}
                      </Accordion>
                    </div>
                  )}
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </header>
  );
}

function DesktopNavPopover({
  item,
  renderLink,
}: {
  item: Nav;
  renderLink: (item: Nav, className: string) => ReactNode;
}) {
  const [openValue, setOpenValue] = useState<string>("");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-3xl font-antonio text-lightGray hover:text-black"
        >
          {item.label.toUpperCase()}
        </button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={16}
        className="w-80 rounded-md bg-darkGray p-4 text-white shadow-xl"
      >
        <div className="flex flex-col gap-2">
          {item.children?.map((child, childIndex) => {
            if (child.children && child.children.length > 0) {
              const value = `${child.label}-${childIndex}`;
              return (
                <Accordion
                  key={value}
                  type="single"
                  collapsible
                  value={openValue}
                  onValueChange={setOpenValue}
                  className="w-full"
                >
                  <AccordionItem
                    value={value}
                    className="border-none"
                    onMouseEnter={() => setOpenValue(value)}
                    onMouseLeave={() => setOpenValue("")}
                  >
                    <AccordionTrigger className="text-2xl font-antonio text-white hover:no-underline">
                      {child.label.toUpperCase()}
                    </AccordionTrigger>
                    <AccordionContent className="mt-2 space-y-2 border-l-2 border-white/20 pl-4">
                      {child.children.map((subItem, subIndex) => (
                        <div key={`${subItem.label}-${subIndex}`}>
                          {renderLink(subItem, "text-xl")}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            }

            return (
              <div key={`${child.label}-${childIndex}`}>
                {renderLink(child, "text-2xl")}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
