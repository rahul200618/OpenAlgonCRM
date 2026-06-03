import { CalendarClock } from "lucide-react";
import { NavItem } from "../nav-main";

type Props = {
  title: string;
};

export const getFollowupsMenuItem = ({ title }: Props): NavItem => {
  return {
    title: title,
    url: "/followups",
    icon: CalendarClock,
  };
};

export default getFollowupsMenuItem;
