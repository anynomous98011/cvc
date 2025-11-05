import {
  type LucideIcon,
  Youtube,
  Twitter,
  Instagram,
  Twitch,
  Facebook,
  MessageCircle,
  Menu,
  Search,
  LogIn,
  LogOut,
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  logo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      {...props}
      fill="currentColor"
    >
      <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.1"/>
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="3"/>
      <text x="50" y="55" textAnchor="middle" fontSize="24" fontWeight="bold" fill="currentColor">CVC</text>
    </svg>
  ),
  google: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" fill="currentColor" {...props}>
      <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.4 56.6l-67.2 64.4C328.5 97.2 291.1 80 248 80c-82.3 0-149.3 66.5-149.3 148.8s67 148.8 149.3 148.8c99.7 0 129.3-81.5 133.6-124.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z" />
    </svg>
  ),
  social: [Youtube, Twitter, Instagram, Twitch, Facebook, MessageCircle],
  menu: Menu,
  search: Search,
  login: LogIn,
  logout: LogOut,
};
