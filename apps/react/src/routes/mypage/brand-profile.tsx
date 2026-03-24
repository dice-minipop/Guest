import { isAxiosError } from "axios";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { forwardRef, useEffect, useRef, useState } from "react";
import { createBrand, getMyBrandInfo, updateBrand, queryKeys, uploadImageList } from "@/api";
import type { CreateBrandRequest, UpdateBrandRequest } from "@/api";
import type { BrandInfo } from "@/api";
import {
  pickImageFromNative,
  pickImageFromNativeWithPrompt,
  isNativeImagePickerAvailable,
} from "@/utils/nativeImagePicker";
import { BackHeader } from "@/components/BackHeader";
import CameraIcon from "@/assets/icons/Brand/camera.svg?react";
import PlusIcon from "@/assets/icons/Plus/plus.svg?react";
import XIcon from "@/assets/icons/Onboarding/round-x.svg?react";
import FemaleIcon from "@/assets/icons/Target/female.svg?react";
import MaleIcon from "@/assets/icons/Target/male.svg?react";
import { backWithHistory } from "@/shared/navigation/back";

export const Route = createFileRoute("/mypage/brand-profile")({
  component: MypageBrandProfilePage,
});

const EMPTY_BRAND: BrandInfo = {
  id: 0,
  name: "",
  description: "",
  logoUrl: "",
  imageUrls: [],
  targetGender: [],
  targetAgeGroup: [],
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
  "typo-body2 w-full appearance-none rounded-lg border border-(--gray-light) bg-white px-4 py-3 text-[16px] text-(--gray-dark) placeholder:text-(--gray-light) focus:border-(--dice-black) focus:outline-none focus:ring-1 focus:ring-(--dice-black)";

type ImageItem = { kind: "existing"; url: string } | { kind: "new"; url: string; file: File };

function getInitialMainImageItem(brand: BrandInfo): ImageItem | null {
  return brand.logoUrl ? { kind: "existing", url: brand.logoUrl } : null;
}

function getInitialGalleryImageItems(brand: BrandInfo): ImageItem[] {
  return (brand.imageUrls ?? []).map((url) => ({ kind: "existing", url }));
}

function areStringArraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

const BrandProfileForm = forwardRef<
  HTMLFormElement,
  { brand: BrandInfo; onCanSubmitChange?: (canSubmit: boolean) => void }
>(function BrandProfileForm({ brand, onCanSubmitChange }, ref) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);

  const [targetGender, setTargetGender] = useState<string[]>(() => brand.targetGender ?? []);
  const [targetAgeGroup, setTargetAgeGroup] = useState<string[]>(() => brand.targetAgeGroup ?? []);
  const [name, setName] = useState(() => brand.name);
  const [description, setDescription] = useState(() => brand.description ?? "");
  const [homepageUrl] = useState("");
  const [mainImageItem, setMainImageItem] = useState<ImageItem | null>(() =>
    getInitialMainImageItem(brand)
  );
  const [galleryImageItems, setGalleryImageItems] = useState<ImageItem[]>(() =>
    getInitialGalleryImageItems(brand)
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const toggleChip = (arr: string[], value: string, setter: (v: string[]) => void) => {
    if (arr.includes(value)) {
      setter(arr.filter((v) => v !== value));
    } else {
      setter([...arr, value]);
    }
  };

  const handleMainImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0];
    if (!nextFile) return;
    const currentMainImage = mainImageItem;
    if (currentMainImage?.kind === "new") {
      URL.revokeObjectURL(currentMainImage.url);
    }
    setMainImageItem({ kind: "new", url: URL.createObjectURL(nextFile), file: nextFile });
    e.target.value = "";
  };

  const handleGalleryImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const selectedFiles = Array.from(files);
    const allowed = Math.min(selectedFiles.length, Math.max(0, 10 - galleryImageItems.length));
    if (allowed <= 0) return;
    const toAdd = selectedFiles.slice(0, allowed).map((file) => ({
      kind: "new" as const,
      url: URL.createObjectURL(file),
      file,
    }));
    setGalleryImageItems((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  };

  const handleAddImage = async (source?: "gallery" | "camera") => {
    if (galleryImageItems.length >= 10) return;

    const fromNative = source
      ? await pickImageFromNative(source)
      : isNativeImagePickerAvailable()
        ? await pickImageFromNativeWithPrompt()
        : null;

    if (fromNative) {
      setGalleryImageItems((prev) => [
        ...prev,
        { kind: "new", url: URL.createObjectURL(fromNative), file: fromNative },
      ]);
      return;
    }

    if (!source && !isNativeImagePickerAvailable()) {
      galleryImageInputRef.current?.click();
    }
  };

  const handleReplaceMainImage = async (source?: "gallery" | "camera") => {
    const fromNative = source
      ? await pickImageFromNative(source)
      : isNativeImagePickerAvailable()
        ? await pickImageFromNativeWithPrompt()
        : null;

    if (fromNative) {
      const currentMainImage = mainImageItem;
      if (currentMainImage?.kind === "new") {
        URL.revokeObjectURL(currentMainImage.url);
      }
      setMainImageItem({ kind: "new", url: URL.createObjectURL(fromNative), file: fromNative });
      return;
    }

    if (!source && !isNativeImagePickerAvailable()) {
      mainImageInputRef.current?.click();
    }
  };

  const removeImage = (index: number) => {
    const target = galleryImageItems[index];
    if (target?.kind === "new") {
      URL.revokeObjectURL(target.url);
    }
    setGalleryImageItems((prev) => prev.filter((_, i) => i !== index));
  };

  const isExistingBrand = brand.id > 0;

  const mutation = useMutation({
    mutationFn: async ({
      brandId,
      data,
    }: {
      brandId: number | null;
      data: CreateBrandRequest | UpdateBrandRequest;
    }) => {
      if (brandId) {
        await updateBrand(brandId, data);
        return;
      }
      await createBrand(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brand.myInfo });
      navigate({ to: "/mypage", state: { transitionDirection: "back" } });
    },
  });

  const errorMessage = (() => {
    if (!mutation.error) return null;
    if (isAxiosError(mutation.error)) {
      const msg =
        (mutation.error.response?.data as { message?: string })?.message ?? mutation.error.message;
      return msg || `브랜드 프로필 ${isExistingBrand ? "수정" : "등록"}에 실패했습니다.`;
    }
    return mutation.error instanceof Error
      ? mutation.error.message
      : `브랜드 프로필 ${isExistingBrand ? "수정" : "등록"}에 실패했습니다.`;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || mutation.isPending || !isFormValid) return;

    let logoUrl = mainImageItem?.url ?? "";
    if (mainImageItem?.kind === "new") {
      setUploadError(null);
      try {
        const res = await uploadImageList([mainImageItem.file]);
        logoUrl = res.imageUrls?.[0] ?? "";
      } catch (error) {
        if (isAxiosError(error)) {
          const msg = (error.response?.data as { message?: string })?.message ?? error.message;
          setUploadError(msg || "이미지 업로드에 실패했습니다.");
          return;
        }
        throw error;
      }
    }

    let uploadedGalleryUrls: string[] = [];
    const newGalleryFiles = galleryImageItems
      .filter((item): item is Extract<ImageItem, { kind: "new" }> => item.kind === "new")
      .map((item) => item.file);

    if (newGalleryFiles.length > 0) {
      setUploadError(null);
      try {
        const res = await uploadImageList(newGalleryFiles);
        uploadedGalleryUrls = res.imageUrls ?? [];
      } catch (error) {
        if (isAxiosError(error)) {
          const msg = (error.response?.data as { message?: string })?.message ?? error.message;
          setUploadError(msg || "이미지 업로드에 실패했습니다.");
          return;
        }
        throw error;
      }
    }

    let uploadedIndex = 0;
    const imageUrls = galleryImageItems
      .map((item) => {
        if (item.kind === "existing") return item.url;
        const url = uploadedGalleryUrls[uploadedIndex];
        uploadedIndex += 1;
        return url ?? "";
      })
      .filter(Boolean);

    const payload: CreateBrandRequest | UpdateBrandRequest = {
      name: name.trim(),
      description: description.trim(),
      logoUrl,
      imageUrls,
      homepageUrl: homepageUrl.trim(),
      ...(targetGender.length > 0 && { targetGender }),
      ...(targetAgeGroup.length > 0 && { targetAgeGroup }),
    };

    mutation.mutate({ brandId: isExistingBrand ? brand.id : null, data: payload });
  };

  const isFormValid = targetGender.length > 0 && targetAgeGroup.length > 0;
  const initialMainImageUrl = brand.logoUrl ?? "";
  const initialGalleryImageUrls = brand.imageUrls ?? [];
  const mainPreviewUrl = mainImageItem?.url ?? "";
  const galleryPreviewUrls = galleryImageItems.map((item) => item.url);
  const hasChanges =
    name !== brand.name ||
    description !== (brand.description ?? "") ||
    !areStringArraysEqual(targetGender, brand.targetGender ?? []) ||
    !areStringArraysEqual(targetAgeGroup, brand.targetAgeGroup ?? []) ||
    mainPreviewUrl !== initialMainImageUrl ||
    !areStringArraysEqual(galleryPreviewUrls, initialGalleryImageUrls);
  const canSubmit = isExistingBrand
    ? isFormValid && hasChanges && !mutation.isPending
    : isFormValid && !mutation.isPending;

  useEffect(() => {
    onCanSubmitChange?.(canSubmit);
  }, [canSubmit, onCanSubmitChange]);

  return (
    <div className="pb-16">
      <form
        ref={ref}
        id="brand-profile-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-1.5"
      >
        <div className="flex flex-col gap-6">
          {/* 메인 이미지: 전체 너비 375*291 비율, 이미지 없을 때 검정 배경 */}
          <div className="flex flex-col gap-2">
            <input
              ref={mainImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMainImageFileChange}
            />
            <button
              type="button"
              onClick={() => handleReplaceMainImage()}
              className="relative w-full overflow-hidden bg-black"
              style={{ aspectRatio: "375/291" }}
            >
              {mainPreviewUrl ? (
                <>
                  <img src={mainPreviewUrl} alt="" className="h-full w-full object-contain" />
                </>
              ) : null}
              <span
                className={`absolute inset-0 flex items-center justify-center ${
                  mainPreviewUrl ? "bg-(--dim-basic)" : ""
                }`}
                aria-hidden
              >
                <CameraIcon className="h-8 w-8 text-white" />
              </span>
            </button>
          </div>

          <div className="px-5 flex flex-col gap-2">
            <label htmlFor="brand-name" className="typo-caption1 text-(--gray-dark)">
              내 브랜드 이름
            </label>
            <input
              id="brand-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="브랜드 이름을 입력해주세요"
              className={`${inputBase} pr-8`}
              disabled={mutation.isPending}
            />
          </div>

          <div className="px-5 flex flex-col gap-2">
            <label htmlFor="brand-description" className="typo-caption1 text-(--gray-dark)">
              짧은 브랜드 소개
            </label>
            <textarea
              id="brand-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="브랜드를 1~2문장으로 짧게 설명해주세요"
              className={`${inputBase} min-h-[100px] resize-none p-4`}
              disabled={mutation.isPending}
              rows={3}
            />
          </div>

          <div className="px-5 flex flex-col gap-2">
            <label className="typo-caption1 text-(--gray-dark)">
              브랜드, 상품 관련 이미지 (최대 10장)
            </label>
            <input
              ref={galleryImageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryImageFileChange}
            />
            <div className="-mx-5 overflow-x-auto px-5 scrollbar-none">
              <div className="flex w-max flex-nowrap items-center gap-3 pt-1.5 pr-1.5">
                {galleryPreviewUrls.length < 10 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAddImage()}
                      className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-(--gray-light) transition-colors hover:border-(--gray-deep)"
                    >
                      <PlusIcon className="h-6 w-6 shrink-0" />
                      <span className="typo-caption2 text-(--gray-medium)">
                        <span className="text-(--system-purple)">{galleryPreviewUrls.length}</span>
                        {" / 10"}
                      </span>
                    </button>
                  </>
                )}
                {galleryPreviewUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative h-20 w-20 shrink-0 rounded-xl bg-(--gray-light)"
                  >
                    <div className="h-full w-full overflow-hidden rounded-xl border border-(--gray-light)">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -right-[5px] -top-[5px] flex h-[18px] w-[18px] items-center justify-center rounded-full text-white"
                      aria-label="이미지 제거"
                    >
                      <XIcon className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 flex flex-col gap-2">
            <label className="typo-caption1 text-(--gray-dark)">
              브랜드 타겟 성별 (중복 선택 가능)
              <span className="text-(--system-red)">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TARGET_GENDERS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleChip(targetGender, value, setTargetGender)}
                  className={`flex items-center gap-0.5 rounded-full border px-3 py-1 typo-button1 transition-colors ${
                    targetGender.includes(value)
                      ? "border-(--system-purple) bg-white text-(--system-purple)"
                      : "border-(--gray-light) bg-white text-(--gray-dark)"
                  }`}
                >
                  <Icon className="size-6 shrink-0" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 flex flex-col gap-2">
            <label className="typo-caption1 text-(--gray-dark)">
              브랜드 타겟 연령대 (중복 선택 가능)
              <span className="text-(--system-red)">*</span>
            </label>
            <div className="flex flex-wrap gap-1">
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
      {(uploadError || errorMessage) && (
        <p className="px-5 typo-caption2 text-system-red">{uploadError ?? errorMessage}</p>
      )}
    </div>
  );
});

function MypageBrandProfilePage() {
  const navigate = useNavigate();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [canComplete, setCanComplete] = useState(false);

  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: queryKeys.brand.myInfo,
    queryFn: getMyBrandInfo,
    retry: false,
  });

  const brandList = Array.isArray(brands) ? brands : [];
  const brand = brandList[0] ?? EMPTY_BRAND;
  const hasBrand = brandList.length > 0;

  const handleBack = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
    } else {
      navigate({ to: "/mypage", state: { transitionDirection: "back" } });
    }
  };

  const handleComplete = () => {
    if (!canComplete) return;
    formRef.current?.requestSubmit();
  };

  if (brandsLoading) {
    return (
      <div className="min-h-screen bg-dice-white px-5 py-1.5">
        <p className="typo-body2 text-(--gray-deep)">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dice-white">
      <BackHeader
        title={hasBrand ? "나의 브랜드 프로필 편집" : "나의 브랜드 프로필 등록"}
        onBack={handleBack}
        rightSlot={
          <button
            type="button"
            onClick={handleComplete}
            disabled={!canComplete}
            className="min-w-[60px] px-2 typo-button1 text-(--dice-black) transition-colors enabled:hover:opacity-80 disabled:text-(--gray-light)"
          >
            완료
          </button>
        }
      />
      <div aria-hidden style={{ minHeight: 48 }} />
      <BrandProfileForm
        ref={formRef}
        key={brand.id}
        brand={brand}
        onCanSubmitChange={setCanComplete}
      />
    </div>
  );
}
