import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { isAxiosError } from "axios";
import { createBrand } from "@/api";
import type { CreateBrandRequest } from "@/api";
import { uploadImageList } from "@/api/s3";
import {
  pickImageFromNativeGallery,
  pickImageFromNativeCamera,
  isNativeImagePickerAvailable,
} from "@/utils/nativeImagePicker";
import RightArrowIcon from "@/assets/icons/Arrow/right.svg?react";
import PlusIcon from "@/assets/icons/Plus/plus.svg?react";
import XIcon from "@/assets/icons/Onboarding/round-x.svg?react";
import FemaleIcon from "@/assets/icons/Target/female.svg?react";
import MaleIcon from "@/assets/icons/Target/male.svg?react";

export const Route = createFileRoute("/signup/brand-profile")({
  component: BrandProfilePage,
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

function BrandProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetGender, setTargetGender] = useState<string[]>([]);
  const [targetAgeGroup, setTargetAgeGroup] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
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
    setImageFiles((prev) => [...prev, ...newFiles].slice(0, 10));
    const newUrls = newFiles.map((f) => URL.createObjectURL(f));
    setImagePreviewUrls((prev) => [...prev, ...newUrls].slice(0, 10));
    e.target.value = "";
  };

  const handleAddImage = async (source: "gallery" | "camera" = "gallery") => {
    if (imageFiles.length + imagePreviewUrls.length >= 10) return;
    const fromNative =
      source === "gallery"
        ? await pickImageFromNativeGallery()
        : await pickImageFromNativeCamera();
    if (fromNative) {
      setImageFiles((prev) => [...prev, fromNative].slice(0, 10));
      setImagePreviewUrls((prev) => [...prev, URL.createObjectURL(fromNative)].slice(0, 10));
      return;
    }
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviewUrls[index] ?? "");
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async (data: CreateBrandRequest) => {
      await createBrand(data);
    },
    onSuccess: () => {
      navigate({ to: "/login" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mutation.isPending) return;

    let logoUrl = "";
    let imageUrls: string[] = [];

    if (imageFiles.length > 0) {
      setUploadError(null);
      try {
        const res = await uploadImageList(imageFiles);
        imageUrls = res.imageUrls ?? [];
        logoUrl = imageUrls[0] ?? "";
      } catch (err) {
        if (isAxiosError(err)) {
          const msg = (err.response?.data as { message?: string })?.message ?? err.message;
          setUploadError(msg || "이미지 업로드에 실패했습니다.");
          return;
        }
        throw err;
      }
    }

    const payload: CreateBrandRequest = {
      name: name.trim(),
      description: description.trim(),
      logoUrl,
      imageUrls,
      homepageUrl: "",
      ...(targetGender.length > 0 && { targetGender }),
      ...(targetAgeGroup.length > 0 && { targetAgeGroup }),
    };

    mutation.mutate(payload);
  };

  const errorMessage = (() => {
    if (!mutation.error) return null;
    if (isAxiosError(mutation.error)) {
      const msg =
        (mutation.error.response?.data as { message?: string })?.message ?? mutation.error.message;
      return msg || "브랜드 등록에 실패했습니다. 입력 내용을 확인해 주세요.";
    }
    return mutation.error instanceof Error ? mutation.error.message : "브랜드 등록에 실패했습니다.";
  })();

  const isFormValid = targetGender.length > 0 && targetAgeGroup.length > 0;

  return (
    <div className="relative mx-auto max-w-sm">
      <div className="h-screen overflow-y-auto">
        <div className="flex min-h-screen flex-col pb-[72px]">
          <header className="relative flex shrink-0 items-center justify-between py-12">
            <button
              type="button"
              onClick={() => navigate({ to: "/signup" })}
              className="flex h-[48px] w-[48px] items-center justify-center rounded-full text-(--dice-black) transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
              aria-label="뒤로가기"
            >
              <RightArrowIcon className="h-24 w-24" aria-hidden />
            </button>

            <h1 className="typo-subtitle3 absolute left-0 right-0 text-center text-(--dice-black) pointer-events-none">
              브랜드 프로필
            </h1>
            <div className="h-10 w-10 shrink-0" aria-hidden />
          </header>

          <div className="flex flex-1 flex-col justify-center bg-white px-5 pt-0 dark:bg-neutral-800">
            <h2 className="typo-h2 mb-24 text-(--dice-black) dark:text-neutral-300">
              브랜드 프로필을 등록해주세요
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="mb-24 flex flex-col gap-24">
                {/* 1. 브랜드 타겟 성별 */}
                <div className="flex flex-col gap-8">
                  <label className="typo-caption1 text-(--gray-dark) dark:text-neutral-300">
                    브랜드 타겟 성별{" "}
                    <span className="text-(--gray-semilight)">(중복 선택 가능)</span>
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
                            : "border-(--gray-light) bg-white text-(--gray-dark) hover:border-(--gray-deep)"
                        }`}
                      >
                        <Icon className="size-24 shrink-0" aria-hidden />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. 브랜드 타겟 연령대 */}
                <div className="flex flex-col gap-8">
                  <label className="typo-caption1 text-(--gray-dark) dark:text-neutral-300">
                    브랜드 타겟 연령대{" "}
                    <span className="text-(--gray-semilight)">(중복 선택 가능)</span>
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
                            : "border-(--gray-light) bg-white text-(--gray-dark) hover:border-(--gray-deep)"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. 내 브랜드 이름 */}
                <div className="flex flex-col gap-8">
                  <label
                    htmlFor="brand-name"
                    className="typo-caption1 text-(--gray-dark) dark:text-neutral-300"
                  >
                    내 브랜드 이름 <span className="text-(--gray-semilight)">(선택)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="brand-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="브랜드 이름을 입력해주세요"
                      className={`${inputBase} pr-32`}
                      required
                      disabled={mutation.isPending}
                    />
                    {name.trim() && (
                      <button
                        type="button"
                        onClick={() => setName("")}
                        className="absolute right-12 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                        aria-label="지우기"
                      >
                        <XIcon className="h-[18px] w-[18px]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. 짧은 브랜드 소개 */}
                <div className="flex flex-col gap-8">
                  <label
                    htmlFor="brand-description"
                    className="typo-caption1 text-(--gray-dark) dark:text-neutral-300"
                  >
                    짧은 브랜드 소개 <span className="text-(--gray-semilight)">(선택)</span>
                  </label>
                  <textarea
                    id="brand-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="팝업 공간을 대여해주는 호스트와 신뢰할 수 있는 거래를 위해 브랜드를 1~2문장으로 짧게 설명해주세요"
                    className={`${inputBase} min-h-[100px] resize-y p-16`}
                    required
                    disabled={mutation.isPending}
                    rows={3}
                  />
                </div>

                {/* 5. 브랜드, 상품 관련 이미지 */}
                <div className="flex flex-col gap-8">
                  <label className="typo-caption1 text-(--gray-dark) dark:text-neutral-300">
                    브랜드, 상품 관련 이미지{" "}
                    <span className="text-(--gray-semilight)">(최대 10장/선택)</span>
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
                    {imagePreviewUrls.length < 10 && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAddImage("gallery")}
                          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-2 rounded-[12px] border border-(--gray-light) transition-colors hover:border-(--gray-deep)"
                        >
                          <PlusIcon className="h-24 w-24 shrink-0" />
                          <span className="typo-caption2 text-(--gray-medium)">
                            <span className="text-(--system-purple)">
                              {imagePreviewUrls.length}
                            </span>
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
                    {imagePreviewUrls.map((url, index) => (
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
                          className="absolute -right-[5px] -top-[5px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-(--dim-basic) text-white transition-opacity hover:opacity-90"
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
                <p className="mb-12 typo-caption2 text-system-red">{uploadError ?? errorMessage}</p>
              )}
            </form>
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-sm bg-white px-5 pt-4 dark:bg-neutral-800"
        style={{
          paddingBottom: "max(20px, env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="submit"
          disabled={mutation.isPending || !isFormValid}
          className="w-full rounded-lg bg-dice-black px-16 py-[15.5px] typo-button1 text-dice-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? "등록 중..." : "회원가입"}
        </button>
      </div>
    </div>
  );
}
