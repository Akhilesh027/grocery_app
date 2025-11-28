import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  vendorPermissions, 
  imageValidation, 
  canVendorEditCategory, 
  hasUploadQuota 
} from '../data/categoryData';

export default function VendorImageUpload({
  currentVendorId = 'vendor1', // In real app, get from auth context
  categoryName,
  productId,
  currentImage,
  onImageUpdate,
  isVisible,
  onClose
}) {
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    progress: 0,
    error: null
  });
  const [imageData, setImageData] = useState({
    uri: currentImage,
    altText: '',
    description: ''
  });
  const [previewMode, setPreviewMode] = useState(false);

  const vendor = vendorPermissions[currentVendorId];

  // Check vendor permissions
  const canEdit = canVendorEditCategory(currentVendorId, categoryName);
  const hasQuota = hasUploadQuota(currentVendorId);

  const validateImage = (imageUri, imageSize) => {
    // Simulate image validation
    if (imageSize > imageValidation.maxSize) {
      return {
        valid: false,
        error: `Image size must be less than ${imageValidation.maxSize / (1024 * 1024)}MB`
      };
    }
    
    return { valid: true };
  };

  const selectImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        
        // Validate image
        const validation = validateImage(selectedImage.uri, selectedImage.fileSize || 0);
        if (!validation.valid) {
          Alert.alert('Invalid Image', validation.error);
          return;
        }

        setImageData(prev => ({
          ...prev,
          uri: selectedImage.uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const takePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        setImageData(prev => ({
          ...prev,
          uri: selectedImage.uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const uploadImage = async () => {
    if (!imageData.uri || !imageData.altText) {
      Alert.alert('Missing Information', 'Please select an image and provide alt text');
      return;
    }

    setUploadState({ isUploading: true, progress: 0, error: null });

    try {
      // Simulate upload process
      for (let i = 0; i <= 100; i += 10) {
        setUploadState(prev => ({ ...prev, progress: i }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Simulate successful upload
      const uploadedImageUrl = imageData.uri; // In real app, this would be the server URL
      
      // Update vendor quota
      if (vendor) {
        vendor.usedQuota += 1;
      }

      // Call callback to update parent component
      onImageUpdate && onImageUpdate({
        productId,
        imageUrl: uploadedImageUrl,
        altText: imageData.altText,
        description: imageData.description,
        vendorId: currentVendorId
      });

      Alert.alert('Success', 'Image uploaded successfully!');
      onClose();
    } catch (error) {
      setUploadState({ isUploading: false, progress: 0, error: error.message });
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Update Product Image</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Vendor Info */}
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>{vendor?.name}</Text>
            <Text style={styles.vendorQuota}>
              Quota: {vendor?.usedQuota}/{vendor?.uploadQuota} images used
            </Text>
          </View>

          {/* Permission Check */}
          {!canEdit && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>
                You don't have permission to edit {categoryName} category
              </Text>
            </View>
          )}

          {!hasQuota && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>
                Upload quota exceeded. Please contact admin.
              </Text>
            </View>
          )}

          {/* Current Image */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Image</Text>
            <Image source={{ uri: currentImage }} style={styles.currentImage} />
          </View>

          {/* Image Selection */}
          {canEdit && hasQuota && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select New Image</Text>
                <View style={styles.imageSelection}>
                  {imageData.uri && imageData.uri !== currentImage ? (
                    <View style={styles.selectedImageContainer}>
                      <Image source={{ uri: imageData.uri }} style={styles.selectedImage} />
                      <TouchableOpacity 
                        style={styles.previewButton}
                        onPress={() => setPreviewMode(true)}
                      >
                        <Text style={styles.previewButtonText}>Preview</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.placeholderText}>No image selected</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.selectButton} onPress={selectImage}>
                    <Text style={styles.selectButtonText}>📁 Select from Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
                    <Text style={styles.cameraButtonText}>📷 Take Picture</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Image Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Image Details</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Alt Text (Required)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Describe the image for accessibility"
                    value={imageData.altText}
                    onChangeText={(text) => setImageData(prev => ({ ...prev, altText: text }))}
                    maxLength={100}
                  />
                  <Text style={styles.characterCount}>{imageData.altText.length}/100</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description (Optional)</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    placeholder="Additional product description"
                    value={imageData.description}
                    onChangeText={(text) => setImageData(prev => ({ ...prev, description: text }))}
                    multiline
                    numberOfLines={3}
                    maxLength={250}
                  />
                  <Text style={styles.characterCount}>{imageData.description.length}/250</Text>
                </View>
              </View>

              {/* Upload Section */}
              <View style={styles.section}>
                {uploadState.isUploading ? (
                  <View style={styles.uploadProgress}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.uploadProgressText}>
                      Uploading... {uploadState.progress}%
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[
                      styles.uploadButton,
                      (!imageData.uri || !imageData.altText) && styles.uploadButtonDisabled
                    ]} 
                    onPress={uploadImage}
                    disabled={!imageData.uri || !imageData.altText}
                  >
                    <Text style={styles.uploadButtonText}>🚀 Upload Image</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Guidelines */}
              <View style={styles.guidelines}>
                <Text style={styles.guidelinesTitle}>Image Guidelines</Text>
                <Text style={styles.guidelineText}>• Supported formats: JPEG, PNG, WebP</Text>
                <Text style={styles.guidelineText}>• Maximum size: 2MB</Text>
                <Text style={styles.guidelineText}>• Minimum dimensions: 200×200px</Text>
                <Text style={styles.guidelineText}>• Square images work best</Text>
                <Text style={styles.guidelineText}>• High quality, clear product images</Text>
              </View>
            </>
          )}
        </ScrollView>

        {/* Preview Modal */}
        <Modal
          visible={previewMode}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPreviewMode(false)}
        >
          <View style={styles.previewOverlay}>
            <TouchableOpacity 
              style={styles.previewCloseArea}
              onPress={() => setPreviewMode(false)}
            >
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageData.uri }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.previewCloseButton}
                  onPress={() => setPreviewMode(false)}
                >
                  <Text style={styles.previewCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  vendorInfo: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  vendorQuota: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    marginVertical: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  currentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imageSelection: {
    marginBottom: 16,
  },
  selectedImageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  previewButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  uploadProgress: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  uploadProgressText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  uploadButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  guidelines: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  previewCloseButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    alignItems: 'center',
  },
  previewCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});