import { defineQuery } from "next-sanity";

const BANNER_QUERY = defineQuery(
  `*[_type == 'banner'] | order(publishedAt desc)`
);
/** Active homepage banners (inside their schedule window), in display order. */
const HOMEPAGE_BANNERS_QUERY = defineQuery(
  `*[_type == "homepageBanner" && isActive != false
      && (!defined(startsAt) || startsAt <= now())
      && (!defined(endsAt) || endsAt >= now())]
    | order(placement asc, order asc, _createdAt asc){
      _id, placement, title, badge, subtitle, price, buttonText, link, style, icon, order,
      "imageUrl": coalesce(image.asset->url, imageUrl)
    }`
);
const FEATURED_CATEGORY_QUERY = defineQuery(
  `*[_type == 'category' && featured == true] | order(name desc)`
);
const ALL_PRODUCTS_QUERY = defineQuery(
  `*[_type=="product"] | order(name asc){
    ...,
    "categories": categories[]->title,
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0)
  }`
);
const DEAL_PRODUCTS = defineQuery(
  `*[_type == 'product' && (isFlashSale == true || isStudentDeal == true || isClearance == true || isBlackFriday == true || isSpecialOffer == true || status == 'hot' || discount > 0)] | order(_createdAt desc){
    ...,
    "categories": categories[]->title,
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0)
  }`
);
const POPULAR_PRODUCTS = defineQuery(
  `*[_type == 'product' && (status == 'hot' || totalReviews > 0 || averageRating >= 4 || isFeatured == true || featured == true || count(*[_type == "review" && product._ref == ^._id && status == "approved"]) > 0)] | order(coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0) desc, coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0) desc, _createdAt desc) [0...8]{
    ...,
    "categories": categories[]->title,
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0)
  }`
);
const NEW_ARRIVALS = defineQuery(
  `*[_type == 'product'] | order(_createdAt desc) [0...10]{
    ...,
    "categories": categories[]->title,
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0)
  }`
);
const BRANDS_QUERY = defineQuery(`*[_type=='brand'] | order(name asc) `);

// Address Query
const ADDRESS_QUERY = defineQuery(
  `*[_type=="address"] | order(publishedAt desc)`
);

const ALLCATEGORIES_QUERY = defineQuery(
  `*[_type == 'category'] | order(name asc) [0...$quantity]`
);

const ADMIN_CATEGORIES_QUERY = defineQuery(
  `*[_type == 'category'] | order(title asc) {
    _id,
    title,
    slug,
    description,
    featured
  }`
);

const PRODUCT_BY_SLUG_QUERY = defineQuery(
  `*[_type == "product" && slug.current == $slug] | order(name asc) [0]{
    ...,
    productClassification->{
      _id,
      title,
      slug
    },
    category->{
      _id,
      title,
      slug,
      level,
      parent->{
        _id,
        title,
        slug,
        level,
        parent->{
          _id,
          title,
          slug,
          level
        }
      }
    },
    brand->{
      _id,
      name,
      title,
      slug,
      image,
      description
    },
    store->{
      _id,
      name,
      slug,
      logo,
      ownerName,
      location->{ _id, name, city, slug },
      rating,
      verifiedStudent,
      verifiedSeller
    },
    "attributeMap": attributeValues[]{
      "key": attribute->title,
      "slug": attribute->slug.current,
      "type": attribute->type,
      "unit": attribute->unit,
      "value": coalesce(
        valueString,
        valueNumber,
        valueBoolean,
        valueSelect,
        valueMultiSelect
      )
    },
    "averageRating": math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating),
    "totalReviews": count(*[_type == "review" && product._ref == ^._id && status == "approved"]),
    "reviews": *[_type == "review" && product._ref == ^._id && status == "approved"] | order(_createdAt desc) {
      _id,
      rating,
      title,
      content,
      helpful,
      isVerifiedPurchase,
      "createdAt": _createdAt,
      "user": coalesce(user->{ firstName, lastName }, { "firstName": coalesce(userName, "Customer"), "lastName": "" })
    }
  }`
);

const RELATED_PRODUCTS_QUERY = defineQuery(
  `*[_type == "product" && count((categories[]._ref)[@ in $categoryIds]) > 0 && slug.current != $currentSlug] | order(name asc) [0...$limit]{
    _id,
    name,
    slug,
    price,
    discount,
    stock,
    images,
    categories[]->{
      _id,
      title,
      slug
    },
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0)
  }`
);

const PRODUCTS_BY_STORE_QUERY = defineQuery(
  `*[_type == "product" && store._ref == $storeId && slug.current != $currentSlug] | order(_createdAt desc) [0...$limit]{
    _id,
    name,
    slug,
    price,
    discount,
    stock,
    images,
    categories[]->{
      _id,
      title,
      slug
    },
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0)
  }`
);

const BRAND_QUERY = defineQuery(`*[_type == "product" && slug.current == $slug]{
"brandName": brand->title
}`);

const BRANDS_WITH_PRODUCT_COUNT_QUERY = defineQuery(
  `*[_type == 'brand'] | order(name asc) {
    _id,
    name,
    slug,
    image,
    description,
    "productCount": count(*[_type == "product" && brand._ref == ^._id])
  }`
);

const SINGLE_BRAND_BY_SLUG_QUERY = defineQuery(
  `*[_type == 'brand' && slug.current == $slug][0] {
    _id,
    name,
    slug,
    image,
    description,
    "productCount": count(*[_type == "product" && brand._ref == ^._id])
  }`
);

const PRODUCTS_BY_BRAND_SLUG_QUERY = defineQuery(
  `*[_type == 'product' && brand->slug.current == $slug] | order(name asc) {
    ...,
    "categories": categories[]->title,
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0),
    attributeValues[]{
      ...,
      attribute->{ _id, title, slug, type }
    }
  }`
);

const UNIVERSITIES_QUERY = defineQuery(
  `*[_type in ["location", "university"] && (type == "university" || _type == "university" || !defined(type))] | order(name asc) {
    _id,
    name,
    slug,
    city,
    image,
    logo,
    "domain": coalesce(emailDomain, domain),
    "productCount": count(*[_type == "product" && (
      references(^._id) || 
      references(*[_type == "store" && references(^._id)]._id)
    )])
  }`
);

const SINGLE_UNIVERSITY_BY_SLUG_QUERY = defineQuery(
  `*[_type in ["location", "university"] && slug.current == $slug][0] {
    _id,
    name,
    slug,
    city,
    image,
    logo,
    "domain": coalesce(emailDomain, domain),
    "productCount": count(*[_type == "product" && (
      references(^._id) || 
      references(*[_type == "store" && references(^._id)]._id)
    )])
  }`
);

const PRODUCTS_BY_UNIVERSITY_SLUG_QUERY = defineQuery(
  `*[_type == "product" && (
    references(*[_type in ["location", "university"] && slug.current == $slug]._id) ||
    references(*[_type == "store" && references(*[_type in ["location", "university"] && slug.current == $slug]._id)]._id)
  )] | order(name asc) {
    ...,
    "categories": categories[]->title,
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0),
    attributeValues[]{
      ...,
      attribute->{ _id, title, slug, type }
    }
  }`
);

const PRODUCT_CLASSIFICATIONS_QUERY = defineQuery(
  `*[_type == "productClassification"] | order(title asc) {
    _id,
    title,
    slug
  }`
);

const CATEGORIES_HIERARCHY_QUERY = defineQuery(
  `*[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    level,
    description,
    range,
    featured,
    image,
    productType->{
      _id,
      title,
      slug
    },
    parent->{
      _id,
      title,
      slug,
      parent->{
        _id,
        title,
        slug
      }
    },
    attributes[]{
      required,
      attribute->{
        _id,
        title,
        slug,
        type,
        options,
        unit
      }
    }
  }`
);

const PRODUCTS_BY_CLASSIFICATION_QUERY = defineQuery(
  `*[_type == "product" && productClassification->slug.current == $classificationSlug] | order(name asc) {
    ...,
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0),
    productClassification->{
      _id,
      title,
      slug
    },
    category->{
      _id,
      title,
      slug,
      parent->{
        _id,
        title,
        slug
      }
    },
    brand->{
      _id,
      name,
      slug
    },
    "attributeMap": attributeValues[]{
      "key": attribute->title,
      "slug": attribute->slug.current,
      "type": attribute->type,
      "unit": attribute->unit,
      "value": coalesce(
        valueString,
        valueNumber,
        valueBoolean,
        valueSelect,
        valueMultiSelect
      )
    }
  }`
);

const STORES_QUERY = defineQuery(
  `*[_type == "store" && (status != "suspended" || !defined(status))] | order(_createdAt desc){
    _id,
    name,
    slug,
    ownerName,
    description,
    logo,
    banner,
    verifiedStudent,
    verifiedSeller,
    rating,
    location->{
      _id,
      name,
      city,
      slug
    },
    "productCount": count(*[_type == "product" && store._ref == ^._id])
  }`
);

const SINGLE_STORE_BY_SLUG_QUERY = defineQuery(
  `*[_type == "store" && slug.current == $slug && status != "suspended"][0]{
    _id,
    name,
    slug,
    ownerName,
    description,
    logo,
    banner,
    verifiedStudent,
    verifiedSeller,
    rating,
    location->{
      _id,
      name,
      city,
      slug
    },
    "productCount": count(*[_type == "product" && store._ref == ^._id])
  }`
);

const PRODUCTS_BY_STORE_SLUG_QUERY = defineQuery(
  `*[_type == "product" && store->slug.current == $slug] | order(_createdAt desc){
    _id,
    name,
    slug,
    price,
    discount,
    stock,
    images,
    description,
    categories[]->{
      _id,
      title,
      slug
    },
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0)
  }`
);

export {
  BANNER_QUERY,
  HOMEPAGE_BANNERS_QUERY,
  FEATURED_CATEGORY_QUERY,
  ALL_PRODUCTS_QUERY,
  DEAL_PRODUCTS,
  POPULAR_PRODUCTS as FEATURE_PRODUCTS,
  POPULAR_PRODUCTS,
  NEW_ARRIVALS,
  BRANDS_QUERY,
  ADDRESS_QUERY,
  ALLCATEGORIES_QUERY,
  ADMIN_CATEGORIES_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  RELATED_PRODUCTS_QUERY,
  BRAND_QUERY,
  UNIVERSITIES_QUERY,
  PRODUCT_CLASSIFICATIONS_QUERY,
  CATEGORIES_HIERARCHY_QUERY,
  PRODUCTS_BY_CLASSIFICATION_QUERY,
  BRANDS_WITH_PRODUCT_COUNT_QUERY,
  SINGLE_BRAND_BY_SLUG_QUERY,
  PRODUCTS_BY_BRAND_SLUG_QUERY,
  SINGLE_UNIVERSITY_BY_SLUG_QUERY,
  PRODUCTS_BY_UNIVERSITY_SLUG_QUERY,
  PRODUCTS_BY_STORE_QUERY,
  STORES_QUERY,
  SINGLE_STORE_BY_SLUG_QUERY,
  PRODUCTS_BY_STORE_SLUG_QUERY,
};
