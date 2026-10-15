"use client";

import { Dispatch, SetStateAction, useState, useMemo } from "react";
import Title from "../Title";
import { RadioGroup, RadioGroupItem, Label } from "@repo/ui";
import { Category } from "@repo/sanity";
import { ChevronDown, ChevronRight, Layers } from "lucide-react";

export interface ProductClassificationItem {
  _id: string;
  title: string;
  slug?: { current?: string };
  description?: string;
}

export interface ExtendedCategory extends Category {
  parent?: { _id: string; title?: string; slug?: { current?: string }; level?: string };
  productType?: { _id: string; title?: string; slug?: { current?: string } };
  productCount?: number;
  allowedBrands?: { _id: string; name?: string; slug?: { current?: string } }[];
}

interface Props {
  classifications?: ProductClassificationItem[];
  selectedClassification?: string | null;
  onClassificationChange?: (classificationSlug: string | null) => void;
  categories: Category[];
  selectedCategory?: string | null;
  setSelectedCategory: Dispatch<SetStateAction<string | null>>;
}

const CategoryList = ({
  classifications = [],
  selectedClassification,
  onClassificationChange,
  categories,
  selectedCategory,
  setSelectedCategory,
}: Props) => {
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Filter categories by selected classification if any
  const filteredCategories = useMemo(() => {
    const extended = categories as ExtendedCategory[];
    if (!selectedClassification) return extended;
    return extended?.filter((cat) => {
      const pTypeSlug = cat.productType?.slug?.current;
      const pTypeId = cat.productType?._id;
      return pTypeSlug === selectedClassification || pTypeId === selectedClassification;
    });
  }, [categories, selectedClassification]);

  // Group top-level categories and build parent-child lookup
  const { topCategories, childMap } = useMemo(() => {
    const top: ExtendedCategory[] = [];
    const children: Record<string, ExtendedCategory[]> = {};

    filteredCategories?.forEach((cat) => {
      const parentRef = cat.parent?._id;
      if (parentRef) {
        if (!children[parentRef]) children[parentRef] = [];
        children[parentRef].push(cat);
      } else {
        top.push(cat);
      }
    });

    return { topCategories: top.length > 0 ? top : filteredCategories, childMap: children };
  }, [filteredCategories]);

  return (
    <div className="p-6">
      {/* Product Classification Section */}
      <div className="mb-6 pb-5 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <Title className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-ushop-pink" /> Product Classification
          </Title>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onClassificationChange?.(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              !selectedClassification
                ? "bg-ushop-pink text-white shadow-sm ring-2 ring-ushop-pink/20"
                : "bg-gray-100 text-gray-700 hover:bg-ushop-pink/10 hover:text-ushop-pink"
            }`}
          >
            All Classifications
          </button>
          {classifications?.map((cls) => {
            const isSelected =
              selectedClassification === cls.slug?.current || selectedClassification === cls._id;
            return (
              <button
                key={cls._id}
                onClick={() => onClassificationChange?.(cls.slug?.current || cls._id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? "bg-ushop-pink text-white shadow-sm ring-2 ring-ushop-pink/20"
                    : "bg-gray-100 text-gray-700 hover:bg-ushop-pink/10 hover:text-ushop-pink"
                }`}
              >
                {cls.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Tree Header */}
      <div className="flex items-center justify-between mb-4">
        <Title className="text-base font-semibold text-gray-900">
          Categories
        </Title>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {filteredCategories?.length || 0}
        </span>
      </div>

      {/* Category Tree Radio Group */}
      <RadioGroup value={selectedCategory || ""} className="space-y-1">
        {topCategories?.map((category) => {
          const subcats = childMap[category._id] || [];
          const hasChildren = subcats.length > 0;
          const isExpanded = !!expandedCats[category._id];
          const isSelected = selectedCategory === category?.slug?.current;

          return (
            <div key={category?._id} className="space-y-1">
              <div
                onClick={() =>
                  setSelectedCategory(
                    isSelected ? null : (category?.slug?.current as string)
                  )
                }
                className={`group flex items-center space-x-2 px-2 py-1.5 -mx-2 rounded-md hover:bg-ushop-pink/10 cursor-pointer transition-colors duration-150 ${
                  isSelected ? "bg-ushop-pink/10 text-ushop-pink" : ""
                }`}
              >
                {hasChildren ? (
                  <button
                    onClick={(e) => toggleExpand(category._id, e)}
                    className="p-0.5 hover:bg-ushop-pink/20 rounded text-gray-500 hover:text-ushop-pink"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-ushop-pink" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 hover:text-ushop-pink" />
                    )}
                  </button>
                ) : (
                  <span className="w-3.5" />
                )}

                <RadioGroupItem
                  value={category?.slug?.current as string}
                  id={category?.slug?.current}
                  className="border-gray-300 text-ushop-pink focus:ring-ushop-pink"
                />

                <Label
                  htmlFor={category?.slug?.current}
                  className={`flex-1 cursor-pointer text-xs transition-colors duration-150 flex items-center justify-between ${
                    isSelected
                      ? "font-semibold text-ushop-pink"
                      : "text-gray-700 group-hover:text-ushop-pink"
                  }`}
                >
                  <span className="truncate">{category?.title}</span>
                  {category.productCount !== undefined && category.productCount > 0 && (
                    <span className="text-xs text-gray-500 font-normal ml-1">
                      ({category.productCount})
                    </span>
                  )}
                </Label>
              </div>

              {/* Subcategories accordion */}
              {hasChildren && isExpanded && (
                <div className="ml-5 pl-2 border-l border-gray-200 space-y-1 my-1">
                  {subcats.map((sub) => {
                    const leaves = childMap[sub._id] || [];
                    const isSubSelected = selectedCategory === sub?.slug?.current;

                    return (
                      <div key={sub._id} className="space-y-1">
                        <div
                          onClick={() =>
                            setSelectedCategory(
                              isSubSelected ? null : (sub?.slug?.current as string)
                            )
                          }
                          className={`flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-ushop-pink/10 cursor-pointer text-xs ${
                            isSubSelected
                              ? "font-semibold text-ushop-pink bg-ushop-pink/10"
                              : "text-gray-600 hover:text-ushop-pink"
                          }`}
                        >
                          <RadioGroupItem
                            value={sub?.slug?.current as string}
                            id={sub?.slug?.current}
                            className="border-gray-300 text-ushop-pink w-3 h-3 focus:ring-ushop-pink"
                          />
                          <span className="truncate flex-1">{sub.title}</span>
                        </div>

                        {/* Leaves */}
                        {leaves.length > 0 && (
                          <div className="ml-4 space-y-0.5">
                            {leaves.map((leaf) => {
                              const isLeafSelected =
                                selectedCategory === leaf?.slug?.current;
                              return (
                                <div
                                  key={leaf._id}
                                  onClick={() =>
                                    setSelectedCategory(
                                      isLeafSelected
                                        ? null
                                        : (leaf?.slug?.current as string)
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded cursor-pointer text-xs hover:text-ushop-pink hover:bg-ushop-pink/5 ${
                                    isLeafSelected
                                      ? "font-semibold text-ushop-pink bg-ushop-pink/10"
                                      : "text-gray-500"
                                  }`}
                                >
                                  • {leaf.title}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </RadioGroup>

      {selectedCategory && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCategory(null);
          }}
          className="mt-4 text-xs font-medium text-ushop-pink hover:underline underline-offset-2 decoration-1 transition-colors duration-150"
        >
          Clear category filter
        </button>
      )}
    </div>
  );
};

export default CategoryList;
