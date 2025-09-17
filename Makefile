.PHONY: help install start android android-release android-build android-bundle clean lint test dev

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	bash -c "source ~/.bashrc && bun install"

start: ## Start Metro bundler
	bash -c "source ~/.bashrc && npx react-native start"

android: ## Run on Android device/emulator (debug)
	bash -c "source ~/.bashrc && npx react-native run-android"

android-release: ## Run on Android device/emulator (release)
	bash -c "source ~/.bashrc && npx react-native run-android --variant=release"

android-build: ## Build Android APK (release)
	bash -c "source ~/.bashrc && cd android && ./gradlew assembleRelease"

android-bundle: ## Generate bundle for production (no Metro needed)
	bash -c "source ~/.bashrc && npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res"

android-bundle-and-build: ## Generate bundle and build APK
	@echo "Generating bundle..."
	@make android-bundle
	@echo "Building APK..."
	@make android-build
	@echo "APK ready at: android/app/build/outputs/apk/release/app-release.apk"

clean: ## Clean build artifacts
	bash -c "source ~/.bashrc && cd android && ./gradlew clean"
	rm -rf node_modules
	bash -c "source ~/.bashrc && bun install"

lint: ## Run ESLint
	bash -c "source ~/.bashrc && npx eslint ."

test: ## Run tests
	bash -c "source ~/.bashrc && npm test"

dev: ## Start development (Metro + Android)
	@echo "Starting development environment..."
	@make start & sleep 5 && make android

publish: ## Publish app (bundle + build + install)
	@echo "Publishing Colorea app..."
	@make android-bundle-and-build
	@echo "Installing APK on device..."
	bash -c "source ~/.bashrc && adb install -r android/app/build/outputs/apk/release/app-release.apk"
	@echo "✅ App published and installed successfully!"
	@echo "You can now uninstall the app from your device and reinstall it without Metro running."

apk: ## Generate standalone APK (no Metro needed)
	@echo "🚀 Generating standalone APK for Colorea..."
	@echo "Step 1: Cleaning previous builds..."
	@make clean-build
	@echo "Step 2: Generating production bundle..."
	@make android-bundle
	@echo "Step 3: Building release APK..."
	@make android-build
	@echo "✅ APK generated successfully!"
	@echo "📱 APK location: android/app/build/outputs/apk/release/app-release.apk"
	@echo "📏 APK size:"
	@ls -lh android/app/build/outputs/apk/release/app-release.apk 2>/dev/null || echo "APK not found - check build logs"
	@echo ""
	@echo "🔧 To install on device: adb install -r android/app/build/outputs/apk/release/app-release.apk"
	@echo "📤 To share: Copy the APK file to your device and install manually"

clean-build: ## Clean only build artifacts (keep dependencies)
	@echo "Cleaning build artifacts..."
	bash -c "source ~/.bashrc && cd android && ./gradlew clean"
	@echo "✅ Build artifacts cleaned"

apk-info: ## Show APK information
	@echo "📱 APK Information:"
	@echo "Location: android/app/build/outputs/apk/release/app-release.apk"
	@if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then \
		echo "Size: $$(ls -lh android/app/build/outputs/apk/release/app-release.apk | awk '{print $$5}')"; \
		echo "Date: $$(ls -l android/app/build/outputs/apk/release/app-release.apk | awk '{print $$6, $$7, $$8}')"; \
		echo "✅ APK exists and is ready to install"; \
	else \
		echo "❌ APK not found. Run 'make apk' first."; \
	fi