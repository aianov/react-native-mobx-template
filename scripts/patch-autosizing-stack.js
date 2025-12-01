#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const targetFile = path.join(
	__dirname,
	'..',
	'node_modules',
	'expo-modules-core',
	'ios',
	'Core',
	'Views',
	'SwiftUI',
	'AutoSizingStack.swift'
)

const newContent = `// Copyright 2025-present 650 Industries. All rights reserved.

import SwiftUI

extension ExpoSwiftUI {
  public struct AxisSet: OptionSet {
    public init(rawValue: Int) {
      self.rawValue = rawValue
    }
    public let rawValue: Int

    public static let horizontal = AxisSet(rawValue: 1 << 0)
    public static let vertical = AxisSet(rawValue: 1 << 1)

    public static let both: AxisSet = [.horizontal, .vertical]
  }

  public struct AutoSizingStack<Content: SwiftUI.View>: SwiftUI.View {
    let content: Content
    let proxy: ShadowNodeProxy
    let axis: AxisSet

    public init(shadowNodeProxy: ShadowNodeProxy, axis: AxisSet = .both, @ViewBuilder _ content: () -> Content) {
      self.proxy = shadowNodeProxy
      self.content = content()
      self.axis = axis
    }

    public var body: some SwiftUI.View {
      if #available(iOS 16.0, tvOS 16.0, macOS 13.0, *) {
        if proxy !== ShadowNodeProxy.SHADOW_NODE_MOCK_PROXY {
          content.overlay {
            content.fixedSize(horizontal: axis.contains(.horizontal), vertical: axis.contains(.vertical))
              .hidden()
              .background(
                GeometryReader { geometry in
                  Color.clear.preference(key: SizePreferenceKey.self, value: geometry.size)
                }
              )
              .onPreferenceChange(SizePreferenceKey.self) { size in
                var size = size
                size.width = axis.contains(.horizontal) ? size.width : ShadowNodeProxy.UNDEFINED_SIZE
                size.height = axis.contains(.vertical) ? size.height : ShadowNodeProxy.UNDEFINED_SIZE
                proxy.setViewSize?(size)
              }
          }
        } else {
          content
        }
      } else {
        if proxy !== ShadowNodeProxy.SHADOW_NODE_MOCK_PROXY {
          content.overlay {
            content.fixedSize(horizontal: axis.contains(.horizontal), vertical: axis.contains(.vertical))
              .hidden()
              .background(
                GeometryReader { geometry in
                  Color.clear.preference(key: SizePreferenceKey.self, value: geometry.size)
                }
              )
              .onPreferenceChange(SizePreferenceKey.self) { size in
                var size = size
                size.width = axis.contains(.horizontal) ? size.width : ShadowNodeProxy.UNDEFINED_SIZE
                size.height = axis.contains(.vertical) ? size.height : ShadowNodeProxy.UNDEFINED_SIZE
                proxy.setViewSize?(size)
              }
          }
        } else {
          content
        }
      }
    }
  }
}

// Структура для передачи размера через preference
struct SizePreferenceKey: PreferenceKey {
  static var defaultValue: CGSize = .zero
  static func reduce(value: inout CGSize, nextValue: () -> CGSize) {
    value = nextValue()
  }
}
`

function patchAutoSizingStack() {
	try {
		// Проверяем существует ли целевой файл
		if (!fs.existsSync(targetFile)) {
			console.error('❌ Файл AutoSizingStack.swift не найден:', targetFile)
			process.exit(1)
		}

		// Создаем резервную копию оригинального файла
		const backupFile = targetFile + '.backup'
		if (!fs.existsSync(backupFile)) {
			fs.copyFileSync(targetFile, backupFile)
			console.log('✅ Создана резервная копия:', backupFile)
		}

		// Заменяем содержимое файла
		fs.writeFileSync(targetFile, newContent, 'utf8')
		console.log('✅ Файл AutoSizingStack.swift успешно обновлен')
	} catch (error) {
		console.error('❌ Ошибка при обновлении файла:', error.message)
		process.exit(1)
	}
}

// Запускаем патч
patchAutoSizingStack()
