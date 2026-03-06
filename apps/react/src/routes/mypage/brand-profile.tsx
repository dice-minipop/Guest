import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { forwardRef, useRef, useState } from "react";
import { getMyBrandInfo, updateBrand, queryKeys } from "@/api";
import type { UpdateBrandRequest } from "@/api";
import type { BrandInfo } from "@/api";
import {
  pickImageFromNativeGallery,
  pickImageFromNativeCamera,
  isNativeImagePickerAvailable,
} from "@/utils/nativeImagePicker";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";
import CameraIcon from "@/assets/icons/Brand/camera.svg?react";
import PlusIcon from "@/assets/icons/Plus/plus.svg?react";
import XIcon from "@/assets/icons/Onboarding/round-x.svg?react";
import FemaleIcon from "@/assets/icons/Target/female.svg?react";
import MaleIcon from "@/assets/icons/Target/male.svg?react";
import { backWithHistory } from "@/shared/navigation/back";

export const Route = createFileRoute("/mypage/brand-profile")({
  component: MypageBrandProfilePage,
});

/** 백엔드 미동작 시 사용하는 더미 브랜드 데이터 */
const DUMMY_BRAND: BrandInfo = {
  id: -1,
  name: "나의 브랜드",
  description: "트렌디한 라이프스타일을 제안하는 브랜드입니다.",
  logoUrl: "https://picsum.photos/seed/brand1/400/400",
  imageUrls: [
    "https://picsum.photos/seed/brand1/400/400",
    "https://picsum.photos/seed/brand2/400/400",
    "https://picsum.photos/seed/brand3/400/400",
    "https://picsum.photos/seed/brand4/400/400",
  ],
  targetGender: ["여성"],
  targetAgeGroup: ["20대", "30대"],
};

const TARGET_GENDERS = [
  { value: "여성", label: "여성", Icon: FemaleIcon },
  { value: "남성", label: "남성", Icon: MaleIcon },
] as const;

const TARGET_AGE_GROUPS = [
  { value: "10대이하", label: "10대이하" },
  { value: "20대", label: "20대" },
  { value: "30대", label: "30대" },
  { value: "40대", label: "40대" },
  { value: "50대", label: "50대" },
  { value: "60대이상", label: "60대이상" },
] as const;

const inputBase =
  "typo-body2 w-full appearance-none rounded-lg border border-(--gray-light) bg-white px-16 py-3 text-[16px] text-(--gray-dark) placeholder:text-(--gray-light) focus:border-(--dice-black) focus:outline-none focus:ring-1 focus:ring-(--dice-black)";

function getInitialImageUrls(brand: BrandInfo): string[] {
  return brand.logoUrl
    ? [brand.logoUrl, ...(brand.imageUrls ?? []).filter((u) => u !== brand.logoUrl)]
    : (brand.imageUrls ?? []);
}

const BrandProfileForm = forwardRef<HTMLFormElement, { brand: BrandInfo }>(
  function BrandProfileForm({ brand }, ref) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [targetGender, setTargetGender] = useState<string[]>(() => brand.targetGender ?? []);
    const [targetAgeGroup, setTargetAgeGroup] = useState<string[]>(
      () => brand.targetAgeGroup ?? []
    );
    const [name, setName] = useState(() => brand.name);
    const [description, setDescription] = useState(() => brand.description ?? "");
    const [homepageUrl] = useState("");
    const [existingUrls, setExistingUrls] = useState<string[]>(() => getInitialImageUrls(brand));
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(() =>
      getInitialImageUrls(brand)
    );

    const toggleChip = (arr: string[], value: string, setter: (v: string[]) => void) => {
      if (arr.includes(value)) {
        setter(arr.filter((v) => v !== value));
      } else {
        setter([...arr, value]);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      const newFiles = Array.from(files);
      const totalCount = existingUrls.length + imageFiles.length + newFiles.length;
      const allowed = Math.min(newFiles.length, Math.max(0, 10 - totalCount));
      if (allowed <= 0) return;
      const toAdd = newFiles.slice(0, allowed);
      setImageFiles((prev) => [...prev, ...toAdd]);
      const newUrls = toAdd.map((f) => URL.createObjectURL(f));
      setImagePreviewUrls((prev) => [...prev, ...newUrls]);
      e.target.value = "";
    };

    const removeExistingImage = (index: number) => {
      setExistingUrls((prev) => prev.filter((_, i) => i !== index));
      setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddImage = async (source: "gallery" | "camera" = "gallery") => {
      const totalCount = existingUrls.length + imageFiles.length;
      if (totalCount >= 10) return;
      const fromNative =
        source === "gallery"
          ? await pickImageFromNativeGallery()
          : await pickImageFromNativeCamera();
      if (fromNative) {
        setImageFiles((prev) => [...prev, fromNative]);
        setImagePreviewUrls((prev) => [...prev, URL.createObjectURL(fromNative)]);
        return;
      }
      fileInputRef.current?.click();
    };

    const removeNewImage = (index: number) => {
      const fileIndex = index - existingUrls.length;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      URL.revokeObjectURL(imagePreviewUrls[index] ?? "");
      setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const removeImage = (index: number) => {
      if (index < existingUrls.length) {
        removeExistingImage(index);
      } else {
        removeNewImage(index);
      }
    };

    const isDummy = brand.id === DUMMY_BRAND.id;

    const mutation = useMutation({
      mutationFn: async ({ brandId, data }: { brandId: number; data: UpdateBrandRequest }) => {
        await updateBrand(brandId, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.brand.myInfo });
        navigate({ to: "/mypage", state: { transitionDirection: "back" } });
      },
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!brand || mutation.isPending || !isFormValid) return;

      if (isDummy) {
        navigate({ to: "/mypage", state: { transitionDirection: "back" } });
        return;
      }

      const imageUrls = [...existingUrls];

      const logoUrl = imageUrls[0] ?? "";

      const payload: UpdateBrandRequest = {
        name: name.trim(),
        description: description.trim(),
        logoUrl,
        imageUrls,
        homepageUrl: homepageUrl.trim(),
        ...(targetGender.length > 0 && { targetGender }),
        ...(targetAgeGroup.length > 0 && { targetAgeGroup }),
      };

      mutation.mutate({ brandId: brand.id, data: payload });
    };

    const isFormValid = targetGender.length > 0 && targetAgeGroup.length > 0;
    const allPreviewUrls = imagePreviewUrls;

    return (
      <div className="py-6" style={{ paddingBottom: "var(--spacing-scroll-end, 80px)" }}>
        <form
          ref={ref}
          id="brand-profile-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-24"
        >
          <div className="flex flex-col gap-24">
            {/* 메인 이미지: 전체 너비 375*291 비율, 이미지 없을 때 검정 배경 */}
            <div className="flex flex-col gap-8">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => handleAddImage("gallery")}
                className="relative w-full overflow-hidden bg-black"
                style={{ aspectRatio: "375/291" }}
              >
                {allPreviewUrls[0] != null ? (
                  <>
                    <img src={allPreviewUrls[0]} alt="" className="h-full w-full object-cover" />
                    <span
                      className="absolute inset-0 flex items-center justify-center bg-(--dim-basic)"
                      aria-hidden
                    >
                      <CameraIcon className="h-32 w-32 text-white" />
                    </span>
                  </>
                ) : null}
              </button>
            </div>

            <div className="px-(--spacing-screen-x) flex flex-col gap-8">
              <label htmlFor="brand-name" className="typo-caption1 text-(--gray-dark)">
                내 브랜드 이름
              </label>
              <input
                id="brand-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="브랜드 이름을 입력해주세요"
                className={`${inputBase} pr-32`}
                disabled={mutation.isPending}
              />
            </div>

            <div className="px-(--spacing-screen-x) flex flex-col gap-8">
              <label htmlFor="brand-description" className="typo-caption1 text-(--gray-dark)">
                짧은 브랜드 소개
              </label>
              <textarea
                id="brand-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="브랜드를 1~2문장으로 짧게 설명해주세요"
                className={`${inputBase} min-h-[100px] resize-y p-16`}
                disabled={mutation.isPending}
                rows={3}
              />
            </div>

            <div className="px-(--spacing-screen-x) flex flex-col gap-8">
              <label className="typo-caption1 text-(--gray-dark)">
                브랜드, 상품 관련 이미지 (최대 10장)
              </label>
              <div className="-mx-(--spacing-screen-x) overflow-x-auto px-(--spacing-screen-x) scrollbar-none">
                <div className="flex w-max flex-nowrap items-center gap-12 pt-6 pr-6">
                  {allPreviewUrls.length < 10 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAddImage("gallery")}
                        className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-2 rounded-[12px] border border-(--gray-light) transition-colors hover:border-(--gray-deep)"
                      >
                        <PlusIcon className="h-24 w-24 shrink-0" />
                        <span className="typo-caption2 text-(--gray-medium)">
                          <span className="text-(--system-purple)">{allPreviewUrls.length}</span>
                          {" / 10"}
                        </span>
                      </button>
                      {isNativeImagePickerAvailable() && (
                        <button
                          type="button"
                          onClick={() => handleAddImage("camera")}
                          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-2 rounded-[12px] border border-(--gray-light) transition-colors hover:border-(--gray-deep)"
                          aria-label="카메라로 촬영"
                        >
                          <span className="typo-caption2 text-(--gray-medium)">카메라</span>
                        </button>
                      )}
                    </>
                  )}
                  {allPreviewUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="relative h-20 w-20 shrink-0 rounded-[12px] bg-(--gray-light)"
                    >
                      <div className="h-full w-full overflow-hidden rounded-[12px]">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -right-[5px] -top-[5px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-(--dim-basic) text-white"
                        aria-label="이미지 제거"
                      >
                        <XIcon className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-(--spacing-screen-x) flex flex-col gap-8">
              <label className="typo-caption1 text-(--gray-dark)">
                브랜드 타겟 성별 (중복 선택 가능)
                <span className="text-(--system-red)">*</span>
              </label>
              <div className="flex flex-wrap gap-8">
                {TARGET_GENDERS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleChip(targetGender, value, setTargetGender)}
                    className={`flex items-center gap-2 rounded-full border px-12 py-4 typo-button1 transition-colors ${
                      targetGender.includes(value)
                        ? "border-(--system-purple) bg-white text-(--system-purple)"
                        : "border-(--gray-light) bg-white text-(--gray-dark)"
                    }`}
                  >
                    <Icon className="size-24 shrink-0" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-(--spacing-screen-x) flex flex-col gap-8">
              <label className="typo-caption1 text-(--gray-dark)">
                브랜드 타겟 연령대 (중복 선택 가능)
                <span className="text-(--system-red)">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {TARGET_AGE_GROUPS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleChip(targetAgeGroup, value, setTargetAgeGroup)}
                    className={`rounded border px-2.5 py-[9px] typo-button2 transition-colors ${
                      targetAgeGroup.includes(value)
                        ? "border-(--system-purple) bg-white text-(--system-purple)"
                        : "border-(--gray-light) bg-white text-(--gray-dark)"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
);

function MypageBrandProfilePage() {
  const navigate = useNavigate();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: queryKeys.brand.myInfo,
    queryFn: getMyBrandInfo,
    retry: false,
  });

  const brandList = Array.isArray(brands) ? brands : [];
  const brand = brandList[0] ?? DUMMY_BRAND;

  const handleBack = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
    } else {
      navigate({ to: "/mypage", state: { transitionDirection: "back" } });
    }
  };

  const handleComplete = () => {
    formRef.current?.requestSubmit();
  };

  if (brandsLoading) {
    return (
      <div className="min-h-screen bg-dice-white px-(--spacing-screen-x) py-6">
        <p className="typo-body2 text-(--gray-deep)">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dice-white">
      <header className="relative flex shrink-0 items-center justify-between py-12 px-[3px]">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-[48px] w-[48px] items-center justify-center rounded-full text-(--dice-black) transition-colors hover:bg-neutral-100"
          aria-label="뒤로가기"
        >
          <ArrowRightIcon className="h-24 w-24" aria-hidden />
        </button>

        <h1 className="typo-subtitle3 absolute left-0 right-0 text-center text-(--dice-black) pointer-events-none">
          나의 브랜드 프로필 편집
        </h1>

        <button
          type="button"
          onClick={handleComplete}
          className="h-10 min-w-[60px] shrink-0 px-8 typo-button1 text-(--dice-black) transition-colors hover:opacity-80"
        >
          완료
        </button>
      </header>

      <BrandProfileForm ref={formRef} key={brand.id} brand={brand} />
    </div>
  );
}
