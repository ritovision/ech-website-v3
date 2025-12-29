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
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
    let ticking = false;
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 0);
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const MenuLink = ({
    item,
    className,
    onNavigate,
    withNavLink = false,
  }: {
    item: Nav;
    className?: string;
    onNavigate?: () => void;
    withNavLink?: boolean;
  }) => {
    const href = item.link || "/";
    const external = isExternalLink(href);
    const active = !external && path === href;
    const classes = cn(
      "block font-antonio transition-colors duration-200",
      active ? "text-white" : "text-white/70 hover:text-white",
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

    if (external) {
      return withNavLink ? (
        <NavigationMenuLink asChild>{content}</NavigationMenuLink>
      ) : (
        content
      );
    }

    return withNavLink ? (
      <NavigationMenuLink asChild>{content}</NavigationMenuLink>
    ) : (
      content
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-50 flex w-full items-center justify-between bg-white md:px-16 px-8 md:py-12 py-6 transition-shadow duration-300",
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

      <Dialog open={isMenuOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="hover:cursor-pointer"
            aria-label="Open menu"
          >
            <IoMenuOutline size={50} />
          </button>
        </DialogTrigger>

        <DialogPortal>
          <DialogOverlay className="z-[60] bg-black/90" />
          <DialogPrimitive.Content className="fixed inset-0 z-[70] flex h-full flex-col bg-transparent text-white">
            <DialogTitle className="sr-only">Main menu</DialogTitle>
            <div className="flex items-center justify-between md:pt-12 pt-6 md:px-16 px-8">
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
              <NavigationMenu className="h-full">
                <div className="relative h-full">
                  {panel === "root" && (
                    <div
                      className={cn(
                        "absolute inset-0 overflow-y-auto px-10 pb-10 min-[1000px]:pl-[10%] animate-in fade-in-0 duration-500"
                      )}
                    >
                      <NavigationMenuList className="gap-8 text-5xl">
                        {nav.map((item, index) => (
                          <NavigationMenuItem key={item.label}>
                            {item.children && item.children.length > 0 ? (
                              <button
                                type="button"
                                className="text-5xl font-antonio text-white"
                                onClick={() => openSection(index)}
                              >
                                {item.label.toUpperCase()}
                              </button>
                            ) : (
                              <MenuLink
                                item={item}
                                className="text-5xl"
                                onNavigate={closeMenu}
                                withNavLink
                              />
                            )}
                          </NavigationMenuItem>
                        ))}
                      </NavigationMenuList>
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
                                <AccordionContent
                                  className="mt-2 space-y-2 border-l-2 border-white/20 pl-6"
                                >
                                  {item.children.map((subItem, subIndex) => (
                                    <div key={`${subItem.label}-${subIndex}`}>
                                      <MenuLink
                                        item={subItem}
                                        className="text-2xl text-white/80"
                                        onNavigate={closeMenu}
                                      />
                                    </div>
                                  ))}
                                </AccordionContent>
                              </AccordionItem>
                            );
                          }

                          return (
                            <div key={item.label}>
                              <MenuLink
                                item={item}
                                className="text-3xl"
                                onNavigate={closeMenu}
                              />
                            </div>
                          );
                        })}
                      </Accordion>
                    </div>
                  )}
                </div>
              </NavigationMenu>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </header>
  );
}
