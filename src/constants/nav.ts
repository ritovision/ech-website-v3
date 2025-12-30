import type { Nav } from "@/types";

export const nav: Nav[] = [
  {
    label: "Education",
    children: [
      {
        label: "EIPs",
        link: "/eip",
      },
      {
        label: "Testnets",
        link: "/testnets",
      },
      {
        label: "Upgrades",
        link: "/upgrades",
        children: [
          {
            label: "Fusaka Upgrade",
            link: "/upgrades/fusaka",
          },
          {
            label: "Pectra Upgrade",
            link: "/upgrades/pectra",
          },
          {
            label: "All Upgrade",
            link: "/upgrades",
          },
        ],
      },
      {
        label: "Learn2Earn",
        link: "https://l2e.ethereumcatherders.com",
      },
    ],
  },
  {
    label: "Community",
    children: [
      {
        label: "Podcasts",
        link: "/podcast",
        children: [
          {
            label: "PEEPanEIP",
            link: "/peepaneip",
          },
          {
            label: "Ecosystem Project Demo",
            link: "https://youtube.com/playlist?list=PL4cwHXAawZxrhbMXuCqMsCiwx1lwu_cNs",
          },
          {
            label: "Audio Podcast",
            link: "/podcast",
          },
        ],
      },
      {
        label: "Events & Talks",
        link: "/events",
      },
      {
        label: "Blogs",
        link: "https://blog.ethcatherders.com",
      },
      {
        label: "Meet The Herders",
        link: "/about",
      },
      {
        label: "Get involved",
        link: "/join",
      },
    ],
  },
  {
    label: "Homestead",
    children: [
      {
        label: "Calendar",
        link: "/calendar",
      },
      {
        label: "Surveys",
        link: "/surveys",
      },
      {
        label: "Meetings and Notes",
        link: "/meetings",
      },
    ],
  },
  {
    label: "Donate",
    link: "/donate",
  },
];
