import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { getMyBrandInfo, updateBrand, queryKeys } from "@/api";
import type { UpdateBrandRequest } from "@/api";
import type { BrandInfo } from "@/api";
import { uploadImageList } from "@/api/s3";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";
import PlusIcon from "@/assets/icons/Plus/plus.svg?react";
import XIcon from "@/assets/icons/Onboarding/round-x.svg?react";
import FemaleIcon from "@/assets/icons/Target/female.svg?react";
import MaleIcon from "@/assets/icons/Target/male.svg?react";

export const Route = createFileRoute("/mypage/brand-profile")({
  component: MypageBrandProfilePage,
});

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

function BrandProfileForm({ brand }: { brand: BrandInfo }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetGender, setTargetGender] = useState<string[]>(() => brand.targetGender ?? []);
  const [targetAgeGroup, setTargetAgeGroup] = useState<string[]>(() => brand.targetAgeGroup ?? []);
  const [name, setName] = useState(() => brand.name);
  const [description, setDescription] = useState(() => brand.description ?? "");
  const [homepageUrl] = useState("");
  const [existingUrls, setExistingUrls] = useState<string[]>(() => getInitialImageUrls(brand));
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(() =>
    getInitialImageUrls(brand)
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const mutation = useMutation({
    mutationFn: async ({ brandId, data }: { brandId: number; data: UpdateBrandRequest }) => {
      await updateBrand(brandId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brand.myInfo });
      navigate({ to: "/mypage" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || mutation.isPending) return;

    let imageUrls = [...existingUrls];

    if (imageFiles.length > 0) {
      setUploadError(null);
      try {
        const res = await uploadImageList(imageFiles);
        const newUrls = res.imageUrls ?? [];
        imageUrls = [...existingUrls, ...newUrls];
      } catch (err) {
        if (isAxiosError(err)) {
          const msg = (err.response?.data as { message?: string })?.message ?? err.message;
          setUploadError(msg || "이미지 업로드에 실패했습니다.");
          return;
        }
        throw err;
      }
    }

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

  const errorMessage = (() => {
    if (!mutation.error) return null;
    if (isAxiosError(mutation.error)) {
      const msg =
        (mutation.error.response?.data as { message?: string })?.message ?? mutation.error.message;
      return msg || "브랜드 수정에 실패했습니다. 입력 내용을 확인해 주세요.";
    }
    return mutation.error instanceof Error ? mutation.error.message : "브랜드 수정에 실패했습니다.";
  })();

  const isFormValid = targetGender.length > 0 && targetAgeGroup.length > 0;
  const allPreviewUrls = imagePreviewUrls;

  return (
    <div
      className="px-(--spacing-screen-x) py-6"
      style={{ paddingBottom: "var(--spacing-scroll-end, 80px)" }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-24">
        <div className="flex flex-col gap-24">
          <div className="flex flex-col gap-8">
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

          <div className="flex flex-col gap-8">
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

          <div className="flex flex-col gap-8">
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

          <div className="flex flex-col gap-8">
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

          <div className="flex flex-col gap-8">
            <label className="typo-caption1 text-(--gray-dark)">
              브랜드, 상품 관련 이미지 (최대 10장)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-wrap items-center gap-12">
              {allPreviewUrls.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-2 rounded-[12px] border border-(--gray-light) transition-colors hover:border-(--gray-deep)"
                >
                  <PlusIcon className="h-24 w-24 shrink-0" />
                  <span className="typo-caption2 text-(--gray-medium)">
                    <span className="text-(--system-purple)">{allPreviewUrls.length}</span>
                    {" / 10"}
                  </span>
                </button>
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

        {(errorMessage || uploadError) && (
          <p className="typo-caption2 text-system-red">{uploadError ?? errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending || !isFormValid}
          className="w-full rounded-lg bg-dice-black px-16 py-[15.5px] typo-button1 text-dice-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? "저장 중..." : "저장하기"}
        </button>
      </form>
    </div>
  );
}

function MypageBrandProfilePage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: queryKeys.brand.myInfo,
    queryFn: getMyBrandInfo,
  });

  const brandList = Array.isArray(brands) ? brands : [];
  const brand = brandList[0] ?? null;

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setHeaderHeight(el.offsetHeight);
    });
    ro.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/mypage" });
    }
  };

  if (brandsLoading) {
    return (
      <div className="min-h-screen bg-dice-white px-(--spacing-screen-x) py-6">
        <p className="typo-body2 text-(--gray-deep)">불러오는 중...</p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-dice-white px-(--spacing-screen-x) py-6">
        <p className="typo-body2 text-(--gray-deep)">등록된 브랜드가 없습니다.</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/mypage" })}
          className="mt-4 typo-button1 text-(--system-purple)"
        >
          마이페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dice-white">
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-10 bg-dice-white dark:border-neutral-700 dark:bg-neutral-800"
        style={{
          paddingTop: "max(var(--spacing-12), env(safe-area-inset-top, 0px))",
          paddingBottom: "var(--spacing-12)",
          paddingLeft: "max(var(--spacing-screen-x), env(safe-area-inset-left, 0px))",
          paddingRight: "max(var(--spacing-screen-x), env(safe-area-inset-right, 0px))",
        }}
      >
        <div className="relative flex min-h-[44px] w-full items-center">
          <button
            type="button"
            onClick={handleBack}
            className="w-[48px] h-[48px] flex shrink-0 items-center justify-center text-(--dice-black) transition-opacity hover:opacity-80 active:opacity-70"
            aria-label="뒤로가기"
          >
            <ArrowRightIcon className="size-24" aria-hidden />
          </button>
          <h1 className="typo-subtitle1 absolute left-0 right-0 text-center text-(--dice-black) pointer-events-none">
            브랜드 프로필 수정
          </h1>
          <div className="w-12 shrink-0" aria-hidden />
        </div>
      </header>
      <div aria-hidden style={{ minHeight: headerHeight || 56 }} />
      <BrandProfileForm key={brand.id} brand={brand} />
    </div>
  );
}
