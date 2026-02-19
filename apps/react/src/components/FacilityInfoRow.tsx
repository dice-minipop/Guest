import type { ReactNode } from "react";
import type { FacilityInfoItem } from "../types/space";
import { getFacilityLabel } from "../utils/facility";

import CctvIcon from "@/assets/icons/FacilityInfo/cctv.svg?react";
import ChairIcon from "@/assets/icons/FacilityInfo/chair.svg?react";
import CircleTableIcon from "@/assets/icons/FacilityInfo/circle-table.svg?react";
import CouchIcon from "@/assets/icons/FacilityInfo/couch.svg?react";
import DesktopIcon from "@/assets/icons/FacilityInfo/desktop.svg?react";
import DrinkIcon from "@/assets/icons/FacilityInfo/drink.svg?react";
import FireExtinguisherIcon from "@/assets/icons/FacilityInfo/fire-extinguisher.svg?react";
import FirealarmIcon from "@/assets/icons/FacilityInfo/firealarm.svg?react";
import FirstAidKitIcon from "@/assets/icons/FacilityInfo/first-aid-kit.svg?react";
import LightIcon from "@/assets/icons/FacilityInfo/light.svg?react";
import MonitorIcon from "@/assets/icons/FacilityInfo/monitor.svg?react";
import PrinterIcon from "@/assets/icons/FacilityInfo/printer.svg?react";
import ProjectorIcon from "@/assets/icons/FacilityInfo/projector.svg?react";
import ShelfIcon from "@/assets/icons/FacilityInfo/shelf.svg?react";
import SpeakerIcon from "@/assets/icons/FacilityInfo/speaker.svg?react";
import SquareTableIcon from "@/assets/icons/FacilityInfo/square-table.svg?react";
import StandingTableIcon from "@/assets/icons/FacilityInfo/standing-table.svg?react";
import TvIcon from "@/assets/icons/FacilityInfo/tv.svg?react";
import WaterPurifierIcon from "@/assets/icons/FacilityInfo/water-purifier.svg?react";
import WifiIcon from "@/assets/icons/FacilityInfo/wifi.svg?react";

function normalizeFacilityKey(name: string): string {
  return name
    .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
    .replace(/^firealarm$/i, "fireAlarm");
}

const FACILITY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  cctv: CctvIcon,
  chair: ChairIcon,
  circleTable: CircleTableIcon,
  couch: CouchIcon,
  desktop: DesktopIcon,
  drink: DrinkIcon,
  fireExtinguisher: FireExtinguisherIcon,
  fireAlarm: FirealarmIcon,
  firstAidKit: FirstAidKitIcon,
  light: LightIcon,
  monitor: MonitorIcon,
  printer: PrinterIcon,
  projector: ProjectorIcon,
  shelf: ShelfIcon,
  speaker: SpeakerIcon,
  squareTable: SquareTableIcon,
  standingTable: StandingTableIcon,
  tv: TvIcon,
  waterPurifier: WaterPurifierIcon,
  wifi: WifiIcon,
};

function renderFacilityIcon(name: string, className?: string): ReactNode {
  const key = normalizeFacilityKey(name);
  const Icon = FACILITY_ICON_MAP[key];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export interface FacilityInfoRowProps {
  item: FacilityInfoItem;
  /** 아이콘에 적용할 className */
  iconClassName?: string;
}

/**
 * 시설·집기 한 줄: 아이콘 + 라벨(+ 선택 설명)
 */
export function FacilityInfoRow({ item, iconClassName }: FacilityInfoRowProps) {
  const facilityKey: string = item.name ?? item.key ?? "";
  const label = getFacilityLabel(facilityKey, item.number);
  if (!label) return null;

  const icon = renderFacilityIcon(facilityKey, iconClassName);

  return (
    <div className="flex items-start gap-3">
      {icon ? (
        <div className="flex items-center justify-center bg-bg-light-gray p-[11px] rounded-lg">
          <span
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center text-gray-dark"
            aria-hidden
          >
            {icon}
          </span>
        </div>
      ) : null}
      <div className="min-w-0 flex-1 self-center">
        <span className="typo-body1 text-gray-deep">{label}</span>
        {item.description ? (
          <p className="mt-0.5 typo-caption2 text-gray-semilight">{item.description}</p>
        ) : null}
      </div>
    </div>
  );
}
