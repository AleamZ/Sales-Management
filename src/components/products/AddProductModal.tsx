import React, { useState, useEffect } from "react";
import {
  Modal,
  Tabs,
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox,
  Button,
  Upload,
  Divider,
  Image,
  Table,
  Space,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import type { RcFile } from "antd/es/upload";
import type { UploadFile, UploadChangeParam } from "antd/es/upload/interface";
import { createProduct, updateProduct } from "../../services/products.service"; // Added updateProduct
import {
  ProductDataToCreate,
  ProductData,
} from "../../interface/product.interface"; // Added ProductData
import {
  ProductVariantData,
  ModalSerial,
  AttributeData,
} from "../../interface/product.interface";
import { uploadImage } from "../../services/upload.service";
import {
  handleErrorMessage,
  handleCRUDError,
  showSuccessMessage,
} from "../../utils/errorHandler";
import {
  getNextAvailableBarcode,
  checkBarcodeAvailability,
} from "../../services/barcode.service";

const { TabPane } = Tabs;

interface VariantValue {
  // New interface for variant values
  name: string;
  imageUrl?: string;
}

interface Variant {
  name: string;
  values: VariantValue[]; // Changed from string[]
  hasImage?: boolean; // Added for variant type image association
}

interface DataSourceRow {
  key: string;
  [key: string]: string | number;
}

interface AddProductModalProps {
  visible: boolean;
  mode?: "add" | "edit"; // New prop for mode
  initialProductData?: ProductData; // New prop for initial data when editing
  onCancel: () => void;
  onSubmit: (productData?: ProductData | null) => void; // Allow productData argument
  categories: Array<{ id: string | number; title: string }>;
  brands: Array<{ id: string | number; name: string }>;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  visible,
  mode = "add", // Default to add mode
  initialProductData,
  onCancel,
  onSubmit,
  categories,
  brands,
}) => {
  const [form] = Form.useForm();
  const [description, setDescription] = useState("");
  // const [setImageUrls] = useState<string[]>([]);

  // Separate state for thumbnail and description images
  const [thumbnailFile, setThumbnailFile] = useState<UploadFile | null>(null);
  const [descriptionFileList, setDescriptionFileList] = useState<UploadFile[]>(
    []
  );

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [hasSerial, setHasSerial] = useState(false);
  const [serials, setSerials] = useState<ModalSerial[]>([]);
  const [newSerialNumber, setNewSerialNumber] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  // Barcode state
  const [barcodeValidation, setBarcodeValidation] = useState<{
    isChecking: boolean;
    available: boolean | null;
    suggestions: string[];
    message: string;
  }>({
    isChecking: false,
    available: null,
    suggestions: [],
    message: "",
  });

  // Variant state
  const [productHasVariants, setProductHasVariants] = useState(false); // New state for "Product Has Variants" checkbox
  const [variants, setVariants] = useState<Variant[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariantData[]>(
    []
  );
  const [variantManagesSerial, setVariantManagesSerial] = useState(false); // State for serial management within variants

  // Warning modal state for cost price > sell price
  const [showLossWarning, setShowLossWarning] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<any>(null);

  // Auto-generate barcode function (for initial load)
  const generateInitialBarcode = async () => {
    try {
      const result = await getNextAvailableBarcode();
      form.setFieldValue("barcode", result.nextBarcode);
      setBarcodeValidation({
        isChecking: false,
        available: true,
        suggestions: [],
        message: `Mã tự động: ${result.nextBarcode}`,
      });
    } catch (error: any) {
      handleErrorMessage("Không thể tạo mã tự động", error);
    }
  };

  // Check barcode availability
  const handleBarcodeChange = async (value: string) => {
    if (!value || value.trim() === "") {
      setBarcodeValidation({
        isChecking: false,
        available: null,
        suggestions: [],
        message: "",
      });
      return;
    }

    setBarcodeValidation((prev) => ({ ...prev, isChecking: true }));

    try {
      const result = await checkBarcodeAvailability(value.trim());
      setBarcodeValidation({
        isChecking: false,
        available: result.available,
        suggestions: result.suggestions || [],
        message: result.message,
      });
    } catch (error) {
      setBarcodeValidation({
        isChecking: false,
        available: false,
        suggestions: [],
        message: "Không thể kiểm tra mã sản phẩm",
      });
    }
  };

  // Use suggested barcode
  const handleUseSuggestion = (suggestion: string) => {
    form.setFieldValue("barcode", suggestion);
    handleBarcodeChange(suggestion);
  };

  // Helper function to check if cost price > sell price
  const checkForLossCondition = (values: any): boolean => {
    // Check main product prices
    if (!productHasVariants) {
      const costPrice = Number(values.costPrice) || 0;
      const sellPrice = Number(values.sellingPrice) || 0;
      if (costPrice > sellPrice && sellPrice > 0) {
        return true;
      }
    } else {
      // Check variants prices
      for (const variant of productVariants) {
        const costPrice = Number(variant.costPrice) || 0;
        const sellPrice = Number(variant.sellPrice) || 0;
        if (costPrice > sellPrice && sellPrice > 0) {
          return true;
        }
      }
    }
    return false;
  };

  // Handle proceed with loss warning
  const handleProceedWithLoss = async () => {
    setShowLossWarning(false);
    if (pendingSubmitData) {
      await performSubmit(pendingSubmitData);
      setPendingSubmitData(null);
    }
  };

  // Handle cancel loss warning
  const handleCancelLossWarning = () => {
    setShowLossWarning(false);
    setPendingSubmitData(null);
  };

  // Define serial table columns
  const serialColumns = [
    {
      title: "Số Serial",
      dataIndex: "serialNumber",
      key: "serialNumber",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: unknown, record: ModalSerial) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveSerial(record.id)}
        />
      ),
    },
  ];

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  // This is a mock function - in a real app, you would upload to your server/CDN
  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Effect to update productVariants when variants change
  useEffect(() => {
    if (variants.length < 1 || !productHasVariants) {
      setProductVariants([]);
      return;
    }

    const newProductVariants: ProductVariantData[] = [];
    const existingVariantsMap = new Map(
      productVariants.map((pv) => {
        const key = pv.attribute
          .map((attr) => `${attr.key}:${attr.value}`)
          .sort()
          .join("|");
        return [key, pv];
      })
    );

    const generateVariantsRecursive = (
      depth: number,
      currentAttributes: AttributeData[]
    ) => {
      if (depth === variants.length) {
        const key = currentAttributes
          .map((attr) => `${attr.key}:${attr.value}`)
          .sort()
          .join("|");
        const existingVariant = existingVariantsMap.get(key);

        let derivedMainImage = existingVariant?.mainImage || "";
        if (variants[0]?.hasImage && currentAttributes[0]) {
          const firstVariantValueName = currentAttributes[0].value;
          const firstVariantTypeValue = variants[0].values.find(
            (v) => v.name === firstVariantValueName
          );
          if (firstVariantTypeValue?.imageUrl) {
            derivedMainImage = firstVariantTypeValue.imageUrl;
          }
        }

        newProductVariants.push({
          attribute: [...currentAttributes],
          costPrice: existingVariant?.costPrice || 0,
          sellPrice: existingVariant?.sellPrice || 0,
          stock: variantManagesSerial
            ? existingVariant?.serials?.length || 0
            : existingVariant?.stock || 0,
          description: existingVariant?.description || "",
          mainImage: derivedMainImage,
          listImage:
            (variants[0]?.hasImage && existingVariant?.listImage) || [], // Keep listImage for now
          isDelete: existingVariant?.isDelete || false,
          serials: variantManagesSerial
            ? existingVariant?.serials || []
            : undefined,
        });
        return;
      }

      const currentVariantType = variants[depth];
      (currentVariantType.values || []).forEach((valueObj) => {
        // Iterate over VariantValue objects
        generateVariantsRecursive(depth + 1, [
          ...currentAttributes,
          { key: currentVariantType.name, value: valueObj.name }, // Use valueObj.name
        ]);
      });
    };

    if (
      variants.length > 0 &&
      variants.every((v) => v.name && v.values.length > 0)
    ) {
      generateVariantsRecursive(0, []);
    }
    setProductVariants(newProductVariants);
  }, [variants, productHasVariants, variantManagesSerial]); // Add variantManagesSerial to dependency array

  // Handle change in "Variant Manages Serial" checkbox
  const handleVariantManagesSerialChange = (e: {
    target: { checked: boolean };
  }) => {
    const isChecked = e.target.checked;
    setVariantManagesSerial(isChecked);
    if (!isChecked) {
      // Clear serials from all product variants if serial management is turned off
      // Stock becomes manually editable, values are preserved from before.
      setProductVariants((prev) =>
        prev.map((pv) => ({ ...pv, serials: undefined }))
      );
    } else {
      // Initialize serials array and update stock based on serials length
      setProductVariants((prev) =>
        prev.map((pv) => ({
          ...pv,
          serials: pv.serials || [], // Ensure serials array exists
          stock: (pv.serials || []).length, // Update stock based on serials length
        }))
      );
    }
  };

  // Handle adding a new serial
  const handleAddSerial = () => {
    if (newSerialNumber && newSerialNumber.trim() !== "") {
      const newSerial: ModalSerial = {
        id: new Date().getTime().toString(),
        serialNumber: newSerialNumber,
      };
      setSerials([...serials, newSerial]);
      setNewSerialNumber("");
    }
  };

  // Handle removing a serial
  const handleRemoveSerial = (id: string) => {
    setSerials(serials.filter((serial) => serial.id !== id));
  };

  // Effect to populate form when in edit mode and initialProductData changes
  useEffect(() => {
    if (visible && mode === "edit" && initialProductData) {
      // Populate form fields with initial data
      form.setFieldsValue({
        barcode: initialProductData.barcode,
        productName: initialProductData.name,
        categoryId: initialProductData.categoryId,
        brandId: initialProductData.brandId,
        costPrice: initialProductData.costPrice,
        sellingPrice: initialProductData.sellPrice,
        stock: initialProductData.stock,
        hasSerial:
          initialProductData.isSerial && !initialProductData.isVariable,
        productHasVariants: initialProductData.isVariable,
      });

      // Set description
      setDescription(initialProductData.description || "");

      // Process images - set thumbnail and description images separately
      const initialImages = initialProductData.listImage || [];
      const mainImage = initialProductData.mainImage || "";

      // Set thumbnail
      if (mainImage) {
        setThumbnailFile({
          uid: "-1",
          name: "thumbnail.png",
          status: "done",
          url: mainImage,
        });
      } else {
        setThumbnailFile(null);
      }

      // Set description images (excluding the main image)
      const descImages = initialImages.filter((img) => img !== mainImage);
      const descImagesList: UploadFile[] = descImages.map((url, index) => ({
        uid: `-${index}`,
        name: `image-${index}.png`,
        status: "done",
        url,
      }));
      setDescriptionFileList(descImagesList);

      // Handle product variants
      setProductHasVariants(initialProductData.isVariable || false);
      if (initialProductData.isVariable && initialProductData.variables) {
        // Process variants
        const uniqueVariantTypes = new Map();
        const variantTypeValues = new Map();
        const variantWithImage = new Set();

        initialProductData.variables.forEach((variant) => {
          variant.attribute.forEach((attr, idx) => {
            if (!uniqueVariantTypes.has(attr.key)) {
              uniqueVariantTypes.set(attr.key, []);
              variantTypeValues.set(attr.key, new Map());
            }

            if (!variantTypeValues.get(attr.key).has(attr.value)) {
              variantTypeValues.get(attr.key).set(attr.value, {
                name: attr.value,
                imageUrl: idx === 0 ? variant.mainImage : undefined,
              });
            }

            if (idx === 0 && variant.mainImage) {
              variantWithImage.add(attr.key);
            }
          });
        });

        const reconstructedVariants: Variant[] = [];
        uniqueVariantTypes.forEach((_, key) => {
          reconstructedVariants.push({
            name: key,
            values: Array.from(variantTypeValues.get(key).values()),
            hasImage: variantWithImage.has(key),
          });
        });

        setVariants(reconstructedVariants);
        setProductVariants(
          initialProductData.variables.map((v) => ({
            ...v,
            serials: v.serials || [],
          }))
        );

        // Check if variants manage serials
        setVariantManagesSerial(
          initialProductData.variables.some((v) => v.isSerial)
        );
      }

      // Handle serials for non-variant products
      if (!initialProductData.isVariable && initialProductData.isSerial) {
        setHasSerial(true);
        const serialsArray = initialProductData.serials || [];
        setSerials(
          serialsArray.map((serialNumber, index) => ({
            id: `${index}`,
            serialNumber,
          }))
        );
      } else {
        setHasSerial(false);
        setSerials([]);
      }
    } else if (mode === "add" && visible) {
      // Reset form for add mode
      form.resetFields();
      setDescription("");
      setThumbnailFile(null);
      setDescriptionFileList([]);
      setHasSerial(false);
      setSerials([]);
      setNewSerialNumber("");
      setProductHasVariants(false);
      setVariants([]);
      setProductVariants([]);
      setVariantManagesSerial(false);
      setBarcodeValidation({
        isChecking: false,
        available: null,
        suggestions: [],
        message: "",
      });

      generateInitialBarcode();
    }
  }, [visible, mode, initialProductData, form]);

  const handleThumbnailChange = (info: UploadChangeParam<UploadFile>) => {
    if (info.fileList.length > 0) {
      setThumbnailFile(info.fileList[0]);
    } else {
      setThumbnailFile(null);
    }
  };

  // Handle description images upload
  const handleDescriptionImagesChange = (
    info: UploadChangeParam<UploadFile>
  ) => {
    // Just store the files locally without uploading
    setDescriptionFileList(info.fileList);
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const performSubmit = async (values: any) => {
    try {
      setUploadLoading(true);

      let mainImageUrl = "";
      if (thumbnailFile?.originFileObj) {
        try {
          const response = await uploadImage(thumbnailFile.originFileObj);
          if (response.message === "Upload thành công!") {
            mainImageUrl = response.url;
          } else {
            throw new Error("Failed to upload thumbnail");
          }
        } catch (error) {
          handleCRUDError.upload(error);
          setUploadLoading(false);
          return;
        }
      } else if (thumbnailFile?.url) {
        mainImageUrl = thumbnailFile.url;
      }

      let descriptionImageUrls: string[] = [];
      const filesToUpload = descriptionFileList.filter(
        (file) => file.originFileObj
      );
      const existingImageUrls = descriptionFileList
        .filter((file) => file.url && !file.originFileObj)
        .map((file) => file.url as string);

      if (filesToUpload.length > 0) {
        try {
          const uploadPromises = filesToUpload.map((file) =>
            file.originFileObj
              ? uploadImage(file.originFileObj)
              : Promise.resolve(null)
          );

          const responses = await Promise.all(uploadPromises);
          const newImageUrls = responses
            .filter(
              (response) =>
                response && response.message === "Upload thành công!"
            )
            .map((response) => response!.url);

          descriptionImageUrls = [...existingImageUrls, ...newImageUrls];
        } catch (error) {
          handleErrorMessage(error, "Tải ảnh mô tả thất bại");
          setUploadLoading(false);
          return;
        }
      } else {
        descriptionImageUrls = existingImageUrls;
      }

      // Now create the product with the image URLs
      const productDataToSubmit: ProductDataToCreate = {
        name: values.productName,
        barcode: values.barcode, // Required barcode (suggested by frontend)
        costPrice: values.costPrice,
        sellPrice: values.sellingPrice,
        stock: hasSerial ? serials.length : values.stock,
        description: description,
        brandId: values.brandId,
        categoryId: values.categoryId,
        mainImage: mainImageUrl,
        listImage: [mainImageUrl, ...descriptionImageUrls].filter(Boolean),
        isVariable: productHasVariants,
        isSerial: hasSerial,
        serials: hasSerial ? serials.map((s) => s.serialNumber) : [],
        variablesProduct: productHasVariants
          ? productVariants.map((v2) => ({
              attribute: v2.attribute,
              costPrice: v2.costPrice,
              sellPrice: v2.sellPrice,
              stock: variantManagesSerial ? v2.serials?.length || 0 : v2.stock,
              mainImage: v2.mainImage,
              listImage: v2.listImage || [],
              isDelete: false,
              isSerial: variantManagesSerial,
              serials: variantManagesSerial ? v2.serials : [],
            }))
          : [],
      };

      let result;
      if (mode === "add") {
        result = await createProduct(productDataToSubmit);
        showSuccessMessage("Thêm", "sản phẩm");
      } else {
        // For edit mode, we need the product ID
        if (!initialProductData?._id) {
          throw new Error("Missing product ID for update");
        }

        result = await updateProduct(
          initialProductData._id,
          productDataToSubmit
        );
        showSuccessMessage("Cập nhật", "sản phẩm");
      }

      // Reset form and state
      form.resetFields();
      setDescription("");
      setThumbnailFile(null);
      setDescriptionFileList([]);
      setHasSerial(false);
      setSerials([]);
      setNewSerialNumber("");
      setProductHasVariants(false);
      setVariants([]);
      setProductVariants([]);
      setVariantManagesSerial(false);
      setBarcodeValidation({
        isChecking: false,
        available: null,
        suggestions: [],
        message: "",
      });

      // Send the result back to the parent for immediate refresh
      onSubmit((result as { data?: ProductData })?.data || null);
    } catch (error: any) {
      if (mode === "add") {
        handleCRUDError.create("sản phẩm", error);
      } else {
        handleCRUDError.update("sản phẩm", error);
      }
    } finally {
      setUploadLoading(false);
    }
  };

  // Main submit handler with loss warning check
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Check if barcode is conflicted
      const currentBarcode = values.barcode;
      if (currentBarcode && barcodeValidation.available === false) {
        Modal.error({
          title: "Mã sản phẩm đã tồn tại",
          content:
            "Vui lòng chọn mã khác hoặc sử dụng gợi ý bên dưới trước khi tiếp tục.",
        });
        return;
      }

      // Check for loss condition (cost price > sell price)
      if (checkForLossCondition(values)) {
        setPendingSubmitData(values);
        setShowLossWarning(true);
        return;
      }

      // No loss detected, proceed with submit
      await performSubmit(values);
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  // Cancel handler - reset all form data
  const handleCancel = () => {
    form.resetFields();
    setDescription("");
    setThumbnailFile(null);
    setDescriptionFileList([]);
    setHasSerial(false);
    setSerials([]);
    setNewSerialNumber("");
    setProductHasVariants(false); // Reset productHasVariants state
    setVariants([]);
    setProductVariants([]);
    setVariantManagesSerial(false); // Reset variantManagesSerial state
    setBarcodeValidation({
      isChecking: false,
      available: null,
      suggestions: [],
      message: "",
    });
    onCancel();
  };

  // // Define the custom request function to prevent default upload behavior
  // const customRequest = ({ onSuccess }: any) => {
  //     setTimeout(() => {
  //         onSuccess("ok");
  //     }, 0);
  // };

  const handleAddVariant = () => {
    if (variants.length >= 2) {
      Modal.warning({
        title: "Giới hạn biến thể",
        content: "Bạn chỉ có thể tạo tối đa 2 loại biến thể.",
      });
      return;
    }
    setVariants([...variants, { name: "", values: [], hasImage: false }]);
  };

  const handleVariantChange = (
    index: number,
    key: "name" | "values" | "hasImage",
    value: string | string[] | boolean
  ) => {
    const updatedVariants = [...variants];
    if (key === "name" && typeof value === "string") {
      updatedVariants[index].name = value;
    } else if (key === "values" && Array.isArray(value)) {
      updatedVariants[index].values = value as unknown as VariantValue[];
    } else if (key === "hasImage" && typeof value === "boolean") {
      updatedVariants[index].hasImage = value;
      if (index === 0 && !value) {
        setProductVariants((prevPvs) =>
          prevPvs.map((pv) => ({ ...pv, mainImage: "", listImage: [] }))
        );
      }
    }
    setVariants(updatedVariants);
  };

  const handleAddValue = (variantIndex: number) => {
    const updatedVariants = [...variants];
    if (updatedVariants[variantIndex].values.length >= 8) {
      Modal.warning({
        title: "Giới hạn giá trị",
        content: "Bạn chỉ có thể thêm tối đa 8 giá trị cho mỗi biến thể.",
      });
      return;
    }
    updatedVariants[variantIndex].values.push({ name: "", imageUrl: "" });
    setVariants(updatedVariants);
  };

  const handleValueChange = (
    variantIndex: number,
    valueIndex: number,
    valueName: string // This is now the name of the value
  ) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].values[valueIndex].name = valueName;
    setVariants(updatedVariants);
  };

  const handleVariantValueImageChange = async (
    variantIndex: number,
    valueIndex: number,
    info: UploadChangeParam<UploadFile>
  ) => {
    const updatedVariants = [...variants];
    let imageUrl =
      updatedVariants[variantIndex].values[valueIndex].imageUrl || "";

    if (info.file.status === "done") {
      imageUrl = info.file.originFileObj
        ? await getBase64(info.file.originFileObj as RcFile)
        : info.file.url || "";
    } else if (info.file.status === "removed") {
      imageUrl = "";
    } else if (info.file.status === "uploading") {
      return; // Wait for upload to complete
    }

    updatedVariants[variantIndex].values[valueIndex].imageUrl = imageUrl;
    setVariants(updatedVariants);
    // Trigger product variants regeneration because mainImage might depend on this
    // This will be handled by the useEffect dependency on `variants`
  };

  const handleRemoveValue = (variantIndex: number, valueIndex: number) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].values.splice(valueIndex, 1);
    setVariants(updatedVariants);
  };

  const handleRemoveVariant = (variantIndex: number) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(variantIndex, 1);
    setVariants(updatedVariants);
  };

  // Handle variant field changes (price, stock, etc.)
  const handleVariantFieldChange = (
    attributeKeys: string[],
    attributeValues: (string | number)[],
    field: string,
    value: unknown
  ) => {
    setProductVariants((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((variant) => {
        return variant.attribute.every((attr, idx) => {
          return (
            attr.key === attributeKeys[idx] &&
            attr.value === attributeValues[idx]
          );
        });
      });

      if (index >= 0) {
        updated[index] = {
          ...updated[index],
          [field]:
            field === "costPrice" || field === "sellPrice" || field === "stock"
              ? Number(value)
              : value,
        };
      }

      return updated;
    });
  };

  // Handle variant serials changes
  const handleVariantSerialsChange = (
    attributeKeysOfCurrentVariant: string[],
    attributeValuesOfCurrentVariant: (string | number)[],
    newSerialsForCurrentVariant: string[]
  ) => {
    // 1. Check for duplicates within the newly entered serials for the current variant
    const uniqueNewSerials = new Set(newSerialsForCurrentVariant);
    if (uniqueNewSerials.size < newSerialsForCurrentVariant.length) {
      const duplicateInInput = newSerialsForCurrentVariant.find(
        (serial, index) => newSerialsForCurrentVariant.indexOf(serial) !== index
      );
      Modal.error({
        title: "Lỗi Serial Trùng Lặp",
        content: `Serial "${duplicateInInput}" được nhập nhiều lần cho cùng một biến thể.`,
      });
      return; // Prevent update
    }

    // 2. Check for duplicates against other variants
    let isDuplicateFoundAcrossVariants = false;
    let duplicateSerialValue = "";

    for (const serial of newSerialsForCurrentVariant) {
      for (let i = 0; i < productVariants.length; i++) {
        const otherVariant = productVariants[i];
        // Skip the current variant being edited
        const isCurrentVariant = otherVariant.attribute.every(
          (attr, idx) =>
            attr.key === attributeKeysOfCurrentVariant[idx] &&
            attr.value === attributeValuesOfCurrentVariant[idx]
        );
        if (isCurrentVariant) {
          continue;
        }

        if (otherVariant.serials && otherVariant.serials.includes(serial)) {
          isDuplicateFoundAcrossVariants = true;
          duplicateSerialValue = serial;
          break;
        }
      }
      if (isDuplicateFoundAcrossVariants) {
        break;
      }
    }

    if (isDuplicateFoundAcrossVariants) {
      Modal.error({
        title: "Lỗi Serial Trùng Lặp",
        content: `Serial "${duplicateSerialValue}" đã tồn tại ở một biến thể khác. Vui lòng sử dụng serial duy nhất.`,
      });
      return; // Prevent update
    }

    // If no duplicates, proceed to update
    setProductVariants((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((variant) =>
        variant.attribute.every(
          (attr, idx) =>
            attr.key === attributeKeysOfCurrentVariant[idx] &&
            attr.value === attributeValuesOfCurrentVariant[idx]
        )
      );

      if (index >= 0) {
        updated[index] = {
          ...updated[index],
          serials: newSerialsForCurrentVariant,
          stock: variantManagesSerial
            ? newSerialsForCurrentVariant.length
            : updated[index].stock,
        };
      }
      return updated;
    });
  };

  // NOTE: Main image for variants is now derived automatically from the first variant value's image
  // See the useEffect that updates productVariants

  // Create data source for variant table
  const variantDataSource: DataSourceRow[] = [];
  if (variants.length > 0) {
    variants[0].values.forEach((value1Obj, index1) => {
      // value1Obj is VariantValue
      if (variants.length === 1) {
        variantDataSource.push({
          key: `${index1}`,
          variant0: value1Obj.name, // Use value1Obj.name
        });
      } else {
        variants[1]?.values.forEach((value2Obj, index2) => {
          // value2Obj is VariantValue
          variantDataSource.push({
            key: `${index1}-${index2}`,
            variant0: value1Obj.name, // Use value1Obj.name
            variant1: value2Obj.name, // Use value2Obj.name
          });
        });
      }
    });
  }

  // Define columns for variant table
  const variantColumns = [
    ...variants.map((variant, index) => ({
      title: variant.name || `Biến thể ${index + 1}`,
      dataIndex: `variant${index}`,
      key: `variant${index}`,
      render: (_: unknown, record: DataSourceRow) => (
        <span>{record[`variant${index}`]?.toString() || ""}</span>
      ),
    })),
    {
      title: "Giá Vốn",
      dataIndex: "costPrice",
      key: "costPrice",
      render: (_: unknown, record: DataSourceRow) => {
        const attributeKeys = variants.map((v) => v.name);
        const attributeValues = [record.variant0, record.variant1].filter(
          Boolean
        );

        return (
          <InputNumber
            placeholder="Giá vốn"
            style={{ width: "100%" }}
            onChange={(value) =>
              handleVariantFieldChange(
                attributeKeys,
                attributeValues,
                "costPrice",
                value
              )
            }
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, "") : "")}
          />
        );
      },
    },
    {
      title: "Giá Bán",
      dataIndex: "sellPrice",
      key: "sellPrice",
      render: (_: unknown, record: DataSourceRow) => {
        const attributeKeys = variants.map((v) => v.name);
        const attributeValues = [record.variant0, record.variant1].filter(
          Boolean
        );

        return (
          <InputNumber
            placeholder="Giá bán"
            style={{ width: "100%" }}
            onChange={(value) =>
              handleVariantFieldChange(
                attributeKeys,
                attributeValues,
                "sellPrice",
                value
              )
            }
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, "") : "")}
          />
        );
      },
    },
    {
      title: "Tồn Kho",
      dataIndex: "stock",
      key: "stock",
      render: (_: unknown, record: DataSourceRow) => {
        const attributeKeys = variants.map((v) => v.name);
        const attributeValues = [record.variant0, record.variant1].filter(
          Boolean
        );

        const productVariant = productVariants.find(
          (pv) =>
            pv.attribute.length === attributeValues.length &&
            pv.attribute.every(
              (attr, idx) =>
                attr.key === attributeKeys[idx] &&
                attr.value === attributeValues[idx]
            )
        );

        return (
          <InputNumber
            placeholder="Tồn kho"
            style={{ width: "100%" }}
            min={0}
            value={productVariant?.stock} // Value comes from state
            disabled={variantManagesSerial} // Disabled if serials manage stock
            onChange={(value) => {
              if (!variantManagesSerial) {
                // Only allow manual change if not managed by serial
                handleVariantFieldChange(
                  attributeKeys,
                  attributeValues,
                  "stock",
                  value
                );
              }
            }}
          />
        );
      },
    },
  ];

  if (variantManagesSerial) {
    variantColumns.push({
      title: "Serials",
      dataIndex: "serials",
      key: "serials",
      render: (_: unknown, record: DataSourceRow) => {
        const attributeKeys = variants.map((v) => v.name);
        // Ensure attributeValues only takes defined values from record, matching variant structure
        const attributeValues: string[] = [];
        if (variants.length > 0 && record.variant0 !== undefined)
          attributeValues.push(String(record.variant0));
        if (variants.length > 1 && record.variant1 !== undefined)
          attributeValues.push(String(record.variant1));

        const productVariant = productVariants.find(
          (pv) =>
            pv.attribute.length === attributeValues.length &&
            pv.attribute.every(
              (attr, idx) =>
                attr.key === attributeKeys[idx] &&
                attr.value === attributeValues[idx]
            )
        );

        return (
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder="Nhập serials"
            value={productVariant?.serials || []}
            onChange={(newSerials) =>
              handleVariantSerialsChange(
                attributeKeys,
                attributeValues,
                newSerials
              )
            }
            tokenSeparators={[","]}
          />
        );
      },
    });
  }

  // Add image columns if the first variant type has images enabled
  if (variants[0]?.hasImage) {
    // Remove previous productVariant-level image upload columns if they exist
    const existingMainImageColumnIndex = variantColumns.findIndex(
      (col) => col.key === "mainImage"
    );
    if (existingMainImageColumnIndex > -1)
      variantColumns.splice(existingMainImageColumnIndex, 1);
    const existingListImageColumnIndex = variantColumns.findIndex(
      (col) => col.key === "listImage"
    );
    if (existingListImageColumnIndex > -1)
      variantColumns.splice(existingListImageColumnIndex, 1);

    variantColumns.splice(
      variants.length,
      0, // Insert after variant attribute columns
      {
        title: `Ảnh (${variants[0]?.name || "Biến thể 1"})`, // Dynamic title
        dataIndex: "variantValueImage", // This dataIndex is conceptual
        key: "variantValueImage",
        render: (_: unknown, record: DataSourceRow) => {
          const firstVariantValueName = String(record.variant0);
          const variantValue = variants[0]?.values.find(
            (v) => v.name === firstVariantValueName
          );
          const imageUrl = variantValue?.imageUrl;

          if (imageUrl) {
            return (
              <Image src={imageUrl} width={50} preview={{ src: imageUrl }} />
            );
          }
          return <span>Không có ảnh</span>;
        },
      }
      // Optionally, re-add a column for ProductVariantData.listImage if still needed for combinations
      // For now, focusing on the value-specific thumbnail as per the prompt.
      // If ProductVariantData.listImage is still needed:
      // {
      //     title: 'Ảnh Phụ Biến Thể (tối đa 4)',
      //     dataIndex: 'listImage', // This refers to ProductVariantData.listImage
      //     key: 'productVariantListImage',
      //     render: (_: unknown, record: DataSourceRow) => {
      //         const attributeKeys = variants.map(v => v.name);
      //         const attributeValues: string[] = [];
      //         if (variants.length > 0 && record.variant0 !== undefined) attributeValues.push(String(record.variant0));
      //         if (variants.length > 1 && record.variant1 !== undefined) attributeValues.push(String(record.variant1));

      //         const productVariant = productVariants.find(pv =>
      //             pv.attribute.length === attributeValues.length &&
      //             pv.attribute.every((attr, idx) => attr.key === attributeKeys[idx] && attr.value === attributeValues[idx])
      //         );

      //         const fileListForUpload: UploadFile[] = productVariant?.listImage?.map((url, i) => ({
      //             uid: `pv-list-${i + 1}`, name: `image${i + 1}.png`, status: 'done', url: url,
      //         })) || [];

      //         return (
      //             <Upload
      //                 action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
      //                 listType="picture-card"
      //                 fileList={fileListForUpload}
      //                 multiple
      //                 maxCount={4}
      //                 onPreview={handlePreview}
      //                 onChange={(info) => handleProductVariantListImageChange(attributeKeys, attributeValues, info)}
      //             >
      //                 {fileListForUpload.length < 4 && uploadButton}
      //             </Upload>
      //         );
      //     }
      // }
    );
  } else {
    // Ensure ProductVariantData image columns are removed if variants[0].hasImage is false
    const existingMainImageColumnIndex = variantColumns.findIndex(
      (col) => col.key === "mainImage" || col.key === "variantValueImage"
    );
    if (existingMainImageColumnIndex > -1)
      variantColumns.splice(existingMainImageColumnIndex, 1);
    const existingListImageColumnIndex = variantColumns.findIndex(
      (col) => col.key === "listImage" || col.key === "productVariantListImage"
    );
    if (existingListImageColumnIndex > -1)
      variantColumns.splice(existingListImageColumnIndex, 1);
  }

  return (
    <>
      <Modal
        title={mode === "add" ? "Thêm Hàng Hóa" : "Sửa Hàng Hóa"}
        open={visible}
        onCancel={handleCancel}
        width={1200}
        footer={[
          <Button key="cancel" onClick={handleCancel} disabled={uploadLoading}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={uploadLoading}
          >
            {mode === "add" ? "Thêm" : "Lưu"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Tabs defaultActiveKey="info">
            <TabPane tab="Thông Tin" key="info">
              <div className="add-product-form-grid">
                <Form.Item
                  name="barcode"
                  label="Series"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã hàng!" },
                  ]}
                  validateStatus={
                    barcodeValidation.isChecking
                      ? "validating"
                      : barcodeValidation.available === false
                      ? "error"
                      : barcodeValidation.available === true
                      ? "success"
                      : ""
                  }
                  help={
                    barcodeValidation.message && (
                      <div>
                        <div
                          style={{
                            color: barcodeValidation.available
                              ? "#52c41a"
                              : "#ff4d4f",
                          }}
                        >
                          {barcodeValidation.message}
                        </div>
                        {barcodeValidation.suggestions.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            <span style={{ color: "#666" }}>Gợi ý: </span>
                            {barcodeValidation.suggestions.map((suggestion) => (
                              <Button
                                key={suggestion}
                                type="link"
                                size="small"
                                style={{ padding: "0 4px", height: "auto" }}
                                onClick={() => handleUseSuggestion(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }
                >
                  <Input
                    placeholder="Mã hàng tự động được tạo, có thể chỉnh sửa"
                    disabled={mode === "edit"} // Disable editing barcode in edit mode
                    onChange={(e) => handleBarcodeChange(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  name="productName"
                  label="Tên Hàng"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên hàng!" },
                  ]}
                >
                  <Input placeholder="Nhập tên hàng" />
                </Form.Item>

                <Form.Item
                  name="categoryId"
                  label="Danh Mục"
                  rules={[
                    { required: true, message: "Vui lòng chọn danh mục!" },
                  ]}
                >
                  <Select placeholder="Chọn danh mục">
                    {categories.map((category) => (
                      <Select.Option key={category.id} value={category.id}>
                        {category.title}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="brandId" label="Thương Hiệu">
                  <Select placeholder="Chọn thương hiệu">
                    {brands.map((brand) => (
                      <Select.Option key={brand.id} value={brand.id}>
                        {brand.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                {!productHasVariants && (
                  <>
                    <Form.Item
                      name="costPrice"
                      label="Giá Vốn"
                      rules={[
                        { required: true, message: "Vui lòng nhập giá vốn!" },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Nhập giá vốn"
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) =>
                          value ? value.replace(/\$\s?|(,*)/g, "") : ""
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      name="sellingPrice"
                      label="Giá Bán"
                      rules={[
                        { required: true, message: "Vui lòng nhập giá bán!" },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Nhập giá bán"
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) =>
                          value ? value.replace(/\$\s?|(,*)/g, "") : ""
                        }
                      />
                    </Form.Item>
                  </>
                )}
                {/* //Sản Phẩm Có Biến Thể và Quản lý bằng Serial/Imei đã ẩn ở đây */}
                {/* <Form.Item name="productHasVariants" valuePropName="checked">
                  <Checkbox
                    checked={productHasVariants}
                    onChange={handleProductHasVariantsChange}
                  >
                    Sản Phẩm Có Biến Thể
                  </Checkbox>
                </Form.Item>
                {!productHasVariants && (
                  <Form.Item name="hasSerial" valuePropName="checked">
                    <Checkbox
                      checked={hasSerial}
                      onChange={handleHasSerialChange}
                    >
                      Quản lý bằng Serial/Imei
                    </Checkbox>
                  </Form.Item>
                )} */}

                {/* Show inventory field if not managing by serial AND product has no variants */}
                {!hasSerial && !productHasVariants && (
                  <Form.Item name="stock" label="Tồn Kho">
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Nhập số lượng tồn kho"
                      min={0}
                      disabled={!productHasVariants && hasSerial} // Disabled if serials are active on main product
                    />
                  </Form.Item>
                )}
              </div>

              {/* Serial management UI - only if not productHasVariants and hasSerial is true */}
              {!productHasVariants && hasSerial && (
                <div className="serial-management" style={{ marginTop: 20 }}>
                  <Divider>Quản lý Serial/Imei</Divider>

                  <Space style={{ marginBottom: 16, width: "100%" }}>
                    <Input
                      placeholder="Nhập số Serial/Imei"
                      value={newSerialNumber}
                      onChange={(e) => setNewSerialNumber(e.target.value)}
                      onPressEnter={handleAddSerial}
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddSerial}
                    >
                      Thêm Serial
                    </Button>
                  </Space>

                  <Table
                    columns={serialColumns}
                    dataSource={serials}
                    rowKey="key"
                    size="small"
                    pagination={{ pageSize: 5 }}
                    style={{ marginBottom: 16 }}
                    summary={() => (
                      <Table.Summary>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0}>
                            <strong>Tổng số Serial: {serials.length}</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1}></Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </div>
              )}

              {/* Modified image section */}
              <Divider>Hình ảnh sản phẩm</Divider>
              <div
                className="product-images-section"
                style={{ marginBottom: 20 }}
              >
                <h4>Ảnh Thumbnail</h4>
                <Upload
                  listType="picture-card"
                  fileList={thumbnailFile ? [thumbnailFile] : []}
                  onPreview={handlePreview}
                  onChange={handleThumbnailChange}
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith("image/");
                    if (!isImage) {
                      handleErrorMessage(
                        null,
                        "Chỉ có thể tải lên file hình ảnh!"
                      );
                      return false;
                    }

                    // Just validate file type, don't upload yet
                    return false; // Prevent default upload
                  }}
                  maxCount={1}
                >
                  {!thumbnailFile && !uploadLoading && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload Thumbnail</div>
                    </div>
                  )}
                </Upload>

                <h4 style={{ marginTop: 16 }}>Ảnh Mô tả</h4>
                <Upload
                  listType="picture-card"
                  fileList={descriptionFileList}
                  onPreview={handlePreview}
                  onChange={handleDescriptionImagesChange}
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith("image/");
                    if (!isImage) {
                      handleErrorMessage(
                        null,
                        "Chỉ có thể tải lên file hình ảnh!"
                      );
                      return false;
                    }

                    // Just validate file type, don't upload yet
                    return false; // Prevent default upload
                  }}
                  onRemove={(file) => {
                    setDescriptionFileList((prev) =>
                      prev.filter((item) => item.uid !== file.uid)
                    );
                    return true;
                  }}
                  multiple
                >
                  {descriptionFileList.length >= 8 || uploadLoading ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>

                {previewImage && (
                  <Image
                    wrapperStyle={{ display: "none" }}
                    preview={{
                      visible: previewOpen,
                      onVisibleChange: (visible) => setPreviewOpen(visible),
                      afterOpenChange: (visible) =>
                        !visible && setPreviewImage(""),
                    }}
                    src={previewImage}
                  />
                )}
              </div>
            </TabPane>
            <TabPane tab="Mô Tả" key="description">
              <div className="quill-editor-container">
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, 4, 5, 6, false] }],
                      ["bold", "italic", "underline", "strike", "blockquote"],
                      [
                        { list: "ordered" },
                        { list: "bullet" },
                        { indent: "-1" },
                        { indent: "+1" },
                      ],
                      ["link", "image"],
                      ["clean"],
                    ],
                  }}
                  formats={[
                    "header",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "blockquote",
                    "list",
                    "bullet",
                    "indent",
                    "link",
                    "image",
                  ]}
                  style={{ height: "300px" }}
                  placeholder="Nhập mô tả sản phẩm..."
                />
              </div>
            </TabPane>
            {productHasVariants && ( // Conditionally render Variants Tab
              <TabPane tab="Biến Thể" key="variants">
                <div className="product-variant-container">
                  <Form.Item style={{ marginBottom: 16 }}>
                    <Checkbox
                      checked={variantManagesSerial}
                      onChange={handleVariantManagesSerialChange}
                    >
                      Quản lý bằng Serial/Imei cho biến thể
                    </Checkbox>
                  </Form.Item>
                  <Button
                    type="primary"
                    onClick={handleAddVariant}
                    className="add-variant-button"
                    style={{ marginBottom: 16 }}
                  >
                    Thêm biến thể
                  </Button>

                  {variants.map((variant, variantIndex) => (
                    <div
                      key={variantIndex}
                      className="variant-card"
                      style={{
                        marginBottom: 16,
                        padding: 16,
                        border: "1px solid #f0f0f0",
                        borderRadius: 4,
                      }}
                    >
                      <Space
                        className="variant-header"
                        style={{
                          marginBottom: 16,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Form.Item
                          label={`Tên biến thể ${variantIndex + 1}`}
                          className="variant-name"
                          style={{ marginBottom: 0, flex: 1 }}
                        >
                          <Input
                            value={variant.name}
                            placeholder="Ví dụ: Màu sắc, Kích thước,..."
                            onChange={(e) =>
                              handleVariantChange(
                                variantIndex,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </Form.Item>
                        {variantIndex === 0 && (
                          <Form.Item
                            name={["variants", variantIndex, "hasImage"]}
                            valuePropName="checked"
                            noStyle
                          >
                            <Checkbox
                              checked={variant.hasImage}
                              onChange={(e) =>
                                handleVariantChange(
                                  variantIndex,
                                  "hasImage",
                                  e.target.checked
                                )
                              }
                            >
                              Có hình ảnh
                            </Checkbox>
                          </Form.Item>
                        )}

                        <Button
                          danger
                          onClick={() => handleRemoveVariant(variantIndex)}
                        >
                          Xóa biến thể
                        </Button>
                      </Space>

                      <Form.Item label="Giá trị" className="variant-values">
                        {variant.values.map(
                          (
                            valueObj,
                            valueIndex // valueObj is VariantValue
                          ) => (
                            <Space
                              key={valueIndex}
                              className="value-item"
                              style={{
                                marginBottom: 8,
                                alignItems: "flex-start",
                              }}
                            >
                              <Input
                                value={valueObj.name} // Use valueObj.name
                                placeholder="Ví dụ: Đỏ, XL,..."
                                onChange={(e) =>
                                  handleValueChange(
                                    variantIndex,
                                    valueIndex,
                                    e.target.value
                                  )
                                }
                                style={{ flex: 1 }}
                              />
                              {variantIndex === 0 && variant.hasImage && (
                                <Upload
                                  action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                                  listType="picture-card"
                                  fileList={
                                    valueObj.imageUrl
                                      ? [
                                          {
                                            uid: "-1",
                                            name: "thumb.png",
                                            status: "done",
                                            url: valueObj.imageUrl,
                                          },
                                        ]
                                      : []
                                  }
                                  maxCount={1}
                                  onPreview={handlePreview}
                                  onChange={(info) =>
                                    handleVariantValueImageChange(
                                      variantIndex,
                                      valueIndex,
                                      info
                                    )
                                  }
                                  showUploadList={{
                                    showPreviewIcon: true,
                                    showRemoveIcon: true,
                                  }}
                                  className="variant-value-image-uploader"
                                >
                                  {!valueObj.imageUrl && uploadButton}
                                </Upload>
                              )}
                              <Button
                                danger
                                onClick={() =>
                                  handleRemoveValue(variantIndex, valueIndex)
                                }
                              >
                                Xóa
                              </Button>
                            </Space>
                          )
                        )}
                        <Button
                          type="dashed"
                          onClick={() => handleAddValue(variantIndex)}
                        >
                          Thêm giá trị
                        </Button>
                      </Form.Item>
                    </div>
                  ))}

                  {variants.length > 0 && variants[0].values.length > 0 && (
                    <>
                      <Divider>Bảng Điều Chỉnh Biến Thể</Divider>
                      <Table
                        dataSource={variantDataSource}
                        columns={variantColumns}
                        pagination={false}
                        bordered
                      />
                    </>
                  )}
                </div>
              </TabPane>
            )}
          </Tabs>
        </Form>
      </Modal>

      {/* Loss Warning Modal */}
      <Modal
        title="⚠️ Cảnh báo lỗ vốn"
        open={showLossWarning}
        onOk={handleProceedWithLoss}
        onCancel={handleCancelLossWarning}
        okText="Tiếp tục"
        cancelText="Hủy"
        okType="danger"
        width={500}
      >
        <div style={{ padding: "16px 0" }}>
          <p style={{ fontSize: "16px", marginBottom: "16px" }}>
            <strong>Giá nhập cao hơn giá bán!</strong>
          </p>
          <p style={{ marginBottom: "12px" }}>
            Việc này có thể dẫn đến thua lỗ khi bán sản phẩm. Vui lòng kiểm tra
            lại:
          </p>
          <ul style={{ marginLeft: "20px", marginBottom: "16px" }}>
            <li>Giá nhập (cost price) của sản phẩm</li>
            <li>Giá bán (sell price) của sản phẩm</li>
            {productHasVariants && (
              <li>Giá nhập và giá bán của các biến thể</li>
            )}
          </ul>
          <p style={{ color: "#ff4d4f", fontWeight: "500" }}>
            Bạn có chắc chắn muốn tiếp tục tạo sản phẩm này không?
          </p>
        </div>
      </Modal>
    </>
  );
};

export default AddProductModal;
