import onBoard1 from "@/assets/lottie/onBoard_1.json";
import onBoard2 from "@/assets/lottie/onBoard_2.json";
import onBoard3 from "@/assets/lottie/onBoard_3.json";

export const LottieItems = [
  {
    title: "원하는 팝업 공간, 쉽고 빠르게 찾기",
    subtitle: "원하는 조건을 설정할 수 있는 필터를 통해\n효율적으로 공간 정보를 탐색하고 예약해요.",
    duration: 7000,
    path: onBoard1 as object,
  },
  {
    title: "맞춤 팝업스토어 지원공고, 한눈에 찾기",
    subtitle: "국내 모든 소상공인·자영업자 대상\n팝업스토어 운영 지원 공고를 모아 보여드려요.",
    duration: 6000,
    path: onBoard2 as object,
  },
  {
    title: "쪽지, 예약으로 호스트와 쉽게 연락하기",
    subtitle:
      "원하는 팝업 공간을 제공하는 호스트와 쪽지를 통해\n직접 연락하고, 캘린더로 일정에 맞춰 예약 가능해요.",
    duration: 6000,
    path: onBoard3 as object,
  },
];
