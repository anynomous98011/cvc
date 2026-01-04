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
  Github,
  Gitlab,
  Linkedin,
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  logo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      fill="currentColor"
    >
      <path d="M144,40.67A103.95,103.95,0,0,0,40.67,144,103.95,103.95,0,0,0,144,247.33a103.32,103.32,0,0,0,84.1-41.22,8,8,0,0,0-11-11.59,88,88,0,0,1-125-132.35A87.87,87.87,0,0,1,168,48.57,8,8,0,0,0,179,43.19,103.32,103.32,0,0,0,144,40.67Z" opacity="0.2"/>
      <path d="M228.16,108.15a8,8,0,0,0-8.32,7.85,88,88,0,0,1-131.79,111.9A8,8,0,0,0,83.8,236.2a104.05,104.05,0,0,0,152.4-120A8,8,0,0,0,228.16,108.15Z" opacity="0.2"/>
      <path d="M236.16,116.15A104.7,104.7,0,0,0,144,19.33,104,104,0,0,0,32,128.23a103.36,103.36,0,0,0,2.69,24.51,8,8,0,0,0,15.2-4.92A88,88,0,0,1,144,35.33a87.88,87.88,0,0,1,87.8,80.12,8,8,0,0,0,15.8,2.1C247.85,116.48,236.16,116.15,236.16,116.15Z"/>
      <path d="M112.56,151.27a8,8,0,0,0,8,8h71.93a8,8,0,0,0,5.65-13.66l-24-24a8,8,0,0,0-11.32,0l-24,24A8,8,0,0,0,112.56,151.27Z"/>
      <path d="M128.84,115.14a8,8,0,0,0,11.31,0l40-40a8,8,0,0,0-11.31-11.31l-40,40A8,8,0,0,0,128.84,115.14Z"/>
    </svg>
  ),
  google: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" fill="currentColor" {...props}>
      <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.4 56.6l-67.2 64.4C328.5 97.2 291.1 80 248 80c-82.3 0-149.3 66.5-149.3 148.8s67 148.8 149.3 148.8c99.7 0 129.3-81.5 133.6-124.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z" />
    </svg>
  ),
  social: [
    Youtube,
    Twitter,
    Instagram,
    Twitch,
    Facebook,
    MessageCircle,
    Github,
    Gitlab,
    Linkedin,
  ],
  menu: Menu,
  search: Search,
  login: LogIn,
  logout: LogOut,
};