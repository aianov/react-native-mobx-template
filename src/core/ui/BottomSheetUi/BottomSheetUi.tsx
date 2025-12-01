import { ContextMenuItem, ContextMenuUi, MainText, SimpleButtonUi } from '@core/ui';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
   BottomSheetBackdrop,
   BottomSheetBackdropProps,
   BottomSheetView
} from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { BackArrowLeftIcon } from '@icons/Ui/BackArrowLeftIcon';
import { changeRgbA } from '@lib/theme';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import React, { JSX, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, Keyboard, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetNavigator, BottomSheetScreen } from './BottomSheetNavigation';

export { useBottomSheetNavigation } from './BottomSheetNavigation';
export type { BottomSheetScreen };

interface CreateStylesParams {
   bg200: string;
   bg400: string;
   secondary100: string;
   bottomSheetBgColor?: string;
   hasHeader: boolean;
}

interface BottomSheetProps {
   leftBtn?: boolean;
   leftBtnPress?: () => void;
   children?: React.ReactNode;
   footer?: JSX.Element | null;
   footerStyle?: StyleProp<ViewStyle>;
   onCloseSignal?: boolean;
   header?: JSX.Element;
   isBottomSheet?: boolean;
   setIsBottomSheet?: (value: boolean) => void;
   setOnCloseSignal?: (value: boolean) => void;
   title?: string;
   commentInput?: boolean;
   menuItems?: ContextMenuItem[];
   bottomSheetViewStyle?: StyleProp<ViewStyle>;
   snap?: string[];
   contextMenuVisible?: boolean;
   setContextMenuVisible?: (value: boolean) => void;
   disabled?: boolean;
   dynamicSizing?: boolean;
   maxDynamicContentSize?: number;
   screens?: BottomSheetScreen[];
   initialScreen?: string;
   bottomSheetBgColor?: string;
}

const BottomSheetState = {
   isAnimating: false,
   isOpen: false,
   timeoutId: null as NodeJS.Timeout | null,
   closeBlocked: false,
   closeBlockTimeoutId: null as NodeJS.Timeout | null,
};

const INSETS_BOTTOM_SUMMARY = 15;

export const isBottomSheetAnimating = () => BottomSheetState.isAnimating;
export const isBottomSheetOpen = () => BottomSheetState.isOpen;

export const BottomSheetUi = observer(({
   children,
   footer = null,
   footerStyle = {},
   leftBtn = false,
   leftBtnPress,
   header,
   isBottomSheet,
   setIsBottomSheet,
   menuItems,
   onCloseSignal,
   setOnCloseSignal,
   contextMenuVisible,
   snap = ["60%", '93%'],
   setContextMenuVisible,
   title = '',
   disabled = false,
   dynamicSizing = false,
   maxDynamicContentSize,
   screens,
   initialScreen,
   bottomSheetBgColor,
}: BottomSheetProps) => {
   const { currentTheme } = themeStore;

   const bottomSheetRef = useRef<BottomSheet>(null);
   const isKeyboardTriggeredChange = useRef(false);
   const userInitiatedSwipe = useRef(false);
   const insets = useSafeAreaInsets();

   const [keyboardHeight, setKeyboardHeight] = useState(-3);
   const [keyboardVisible, setKeyboardVisible] = useState(false);
   const [programmaticSnapChange, setProgrammaticSnapChange] = useState(false);
   const [footerVisible, setFooterVisible] = useState(false);

   const [navTitle, setNavTitle] = useState<string | undefined>(undefined);
   const [showNavBackBtn, setShowNavBackBtn] = useState(false);
   const navGoBackRef = useRef<(() => void) | null>(null);
   const [navContentHeight, setNavContentHeight] = useState<number | undefined>(undefined);
   const blockCloseRef = useRef(false);

   const [swipeTitleState, setSwipeTitleState] = useState<{
      currentTitle: string | undefined;
      targetTitle: string | undefined;
      progress: number;
   } | null>(null);

   const [swipeBackBtnOpacity, setSwipeBackBtnOpacity] = useState<number | null>(null);

   const instantSnapRef = useRef(false);

   const snapToHeightInstant = useCallback((height: number) => {
      console.log('[BottomSheetUi] snapToHeightInstant called:', { height });
      instantSnapRef.current = true;
   }, []);

   const hasScreens = screens && screens.length > 0 && initialScreen;
   const displayTitle = navTitle ?? title;
   const displayLeftBtn = hasScreens ? showNavBackBtn : leftBtn;
   const displayDynamicSizing = hasScreens ? false : dynamicSizing;

   const snapPoints = useMemo(() => {
      if (hasScreens && navContentHeight) {
         const titleHeight = displayTitle ? 50 : 0;
         const bottomPadding = insets.bottom + INSETS_BOTTOM_SUMMARY;
         return [navContentHeight + titleHeight + bottomPadding];
      }
      return displayDynamicSizing ? undefined : snap;
   }, [hasScreens, navContentHeight, displayTitle, insets.bottom, displayDynamicSizing, snap]);

   const prevNavContentHeightRef = useRef<number | undefined>(undefined);

   useLayoutEffect(() => {
      if (hasScreens && navContentHeight && bottomSheetRef.current && snapPoints) {
         const prevHeight = prevNavContentHeightRef.current;
         const isDecreasing = prevHeight !== undefined && navContentHeight < prevHeight;
         const needInstantSnap = instantSnapRef.current;

         console.log('[BottomSheetUi] useLayoutEffect processing:', { prevHeight, navContentHeight, isDecreasing, needInstantSnap });

         prevNavContentHeightRef.current = navContentHeight;

         if (needInstantSnap || isDecreasing) {
            instantSnapRef.current = false;
            setProgrammaticSnapChange(true);
            blockCloseRef.current = true;
            bottomSheetRef.current.snapToIndex(0, { duration: 0 });
            setTimeout(() => {
               blockCloseRef.current = false;
            }, 50);
         } else {
            setProgrammaticSnapChange(true);
            bottomSheetRef.current.snapToIndex(0, { duration: 300 });
         }
      }
   }, [hasScreens, navContentHeight, snapPoints]);

   const footerAnimation = useRef(new Animated.Value(1)).current;
   const footerPositionAnimation = useRef(new Animated.Value(0)).current;
   const footerShowTimer = useRef<NodeJS.Timeout | null>(null);
   const footerAnimationTimer = useRef<NodeJS.Timeout | null>(null);
   const footerAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
   const closeButtonRef = useRef<View>(null);
   const opacity = useRef(new Animated.Value(0)).current;

   const handleSheetClose = useCallback(() => {
      if (blockCloseRef.current) {
         return;
      }

      if (setIsBottomSheet) {
         bottomSheetRef.current?.close();
         BottomSheetState.isOpen = false;
         setIsBottomSheet(false);
      }
   }, [setIsBottomSheet]);

   const handleOnCloseSignal = () => {
      if (bottomSheetRef.current) {
         const animation = Animated.timing(footerAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1)
         });
         footerAnimationRef.current = animation;

         animation.start(() => {
            setFooterVisible(false);
            footerAnimationRef.current = null;
         });

         setTimeout(() => {
            if (bottomSheetRef.current) {
               bottomSheetRef.current.close();
               BottomSheetState.isAnimating = true;

               if (setIsBottomSheet) {
                  setTimeout(() => {
                     setIsBottomSheet(false);
                     BottomSheetState.isOpen = false;
                  }, 100);
               }
            }
         }, 50);
      }
   };

   useEffect(() => {
      if (swipeBackBtnOpacity !== null) return;

      Animated.timing(opacity, {
         toValue: displayLeftBtn ? 1 : 0,
         duration: 300,
         useNativeDriver: true,
      }).start();
   }, [displayLeftBtn, swipeBackBtnOpacity]);

   useEffect(() => {
      if (!onCloseSignal) return;
      handleOnCloseSignal();
      if (setOnCloseSignal) setOnCloseSignal(false);
   }, [onCloseSignal]);

   const forceHideKeyboard = () => {
      Keyboard.dismiss();
      setTimeout(() => {
         Keyboard.dismiss();
      }, 50);
   };

   const handleSheetChanges = useCallback((index: number) => {
      if (programmaticSnapChange) {
         setProgrammaticSnapChange(false);
         return;
      }

      if (userInitiatedSwipe.current) {
         userInitiatedSwipe.current = false;

         if (index === 0 && keyboardVisible) {
         } else {
            forceHideKeyboard();
         }
      } else {
         forceHideKeyboard();
      }

      if (footerShowTimer.current) {
         clearTimeout(footerShowTimer.current);
         footerShowTimer.current = null;
      }

      if (footerAnimationTimer.current) {
         clearTimeout(footerAnimationTimer.current);
         footerAnimationTimer.current = null;
      }

      if (footerAnimationRef.current) {
         footerAnimationRef.current.stop();
         footerAnimationRef.current = null;
      }

      if (index === -1) {
         const animation = Animated.timing(footerAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1)
         });

         footerAnimationRef.current = animation;

         animation.start(() => {
            setFooterVisible(false);
            handleSheetClose();
            footerAnimationRef.current = null;
         });
      } else {
         BottomSheetState.isOpen = true;

         if (!footerVisible && !footerShowTimer.current) {
            // @ts-ignore
            footerShowTimer.current = setTimeout(() => {
               setFooterVisible(true);
               const animation = Animated.spring(footerAnimation, {
                  toValue: 1,
                  useNativeDriver: true,
                  friction: 8,
                  tension: 40
               });

               footerAnimationRef.current = animation;
               animation.start(() => {
                  footerAnimationRef.current = null;
               });

               footerShowTimer.current = null;
            }, 100);
         }
      }
   }, [handleSheetClose, footerAnimation, footerVisible, programmaticSnapChange, keyboardVisible]);

   const handleSheetAnimate = useCallback((fromIndex: number, toIndex: number) => {
      if (isKeyboardTriggeredChange.current) {
         if (toIndex === 1) {
            isKeyboardTriggeredChange.current = false;
         }
         return;
      }

      forceHideKeyboard();

      if (toIndex === -1) {
         if (footerShowTimer.current) {
            clearTimeout(footerShowTimer.current);
            footerShowTimer.current = null;
         }

         if (footerAnimationRef.current) {
            footerAnimationRef.current.stop();
            footerAnimationRef.current = null;
         }

         Animated.timing(footerAnimation, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1)
         }).start();
      } else if (fromIndex === -1 && toIndex !== -1) {
         Animated.spring(footerPositionAnimation, {
            toValue: toIndex,
            useNativeDriver: false,
            friction: 8,
            tension: 40
         }).start();
      }
   }, [footerAnimation, footerPositionAnimation]);

   const handleOpenContextMenu = () => setContextMenuVisible && setContextMenuVisible(true);
   const handleCloseContextMenu = () => setContextMenuVisible && setContextMenuVisible(false);

   const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
         <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.25}
            pressBehavior="close"
         />
      ),
      []
   );

   useEffect(() => {
      return () => {
         BottomSheetState.isAnimating = false;
         BottomSheetState.isOpen = false;
         if (BottomSheetState.timeoutId) {
            clearTimeout(BottomSheetState.timeoutId);
         }
         if (BottomSheetState.closeBlockTimeoutId) {
            clearTimeout(BottomSheetState.closeBlockTimeoutId);
         }
      };
   }, []);

   useEffect(() => {
      const keyboardWillShow = Keyboard.addListener(
         Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
         (e) => {
            setKeyboardHeight(e.endCoordinates.height);
            setKeyboardVisible(true);

            if (bottomSheetRef.current && isBottomSheet) {
               setProgrammaticSnapChange(true);
               isKeyboardTriggeredChange.current = true;
               bottomSheetRef.current.snapToIndex(1);
            }
         }
      );

      const keyboardWillHide = Keyboard.addListener(
         Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
         () => {
            setKeyboardHeight(0);
            setKeyboardVisible(false);
            isKeyboardTriggeredChange.current = false;
         }
      );

      return () => {
         keyboardWillShow.remove();
         keyboardWillHide.remove();
      };
   }, [isBottomSheet]);

   useEffect(() => {
      if (isBottomSheet) {
         setFooterVisible(false);
         footerAnimation.setValue(0);

         // @ts-ignore
         footerShowTimer.current = setTimeout(() => {
            if (isBottomSheet) {
               setFooterVisible(true);

               const animation = Animated.spring(footerAnimation, {
                  toValue: 1,
                  useNativeDriver: true,
                  friction: 8,
                  tension: 40
               });

               footerAnimationRef.current = animation;
               animation.start(() => {
                  footerAnimationRef.current = null;
               });
            }
            footerShowTimer.current = null;
         }, 100);

         return () => {
            if (footerShowTimer.current) {
               clearTimeout(footerShowTimer.current);
               footerShowTimer.current = null;
            }

            if (footerAnimationRef.current) {
               footerAnimationRef.current.stop();
               footerAnimationRef.current = null;
            }
         };
      } else {
         if (footerAnimationRef.current) {
            footerAnimationRef.current.stop();
            footerAnimationRef.current = null;
         }
         setFooterVisible(false);
         footerAnimation.setValue(0);
      }
   }, [isBottomSheet, footerAnimation]);

   useEffect(() => {
      if (isBottomSheet) {
         const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isBottomSheet) {
               console.log('Back button pressed in BottomSheetUi, trying to close');
               handleSheetClose();
               return true;
            }
            return false;
         });

         return () => {
            backHandler.remove();
         };
      }

      return undefined;
   }, [isBottomSheet, handleSheetClose]);

   const styles = useMemo(() => createBottomSheetStyles({
      bg200: currentTheme.bg_200,
      bg400: currentTheme.bg_400,
      secondary100: currentTheme.secondary_100,
      bottomSheetBgColor,
      hasHeader: !!header,
   }), [currentTheme.bg_200, currentTheme.bg_400, currentTheme.secondary_100, bottomSheetBgColor, header]);

   if (!isBottomSheet) return <></>;

   return (
      <Portal>
         <View
            style={styles.container}
         >
            <GestureHandlerRootView>
               <BottomSheet
                  ref={bottomSheetRef}
                  snapPoints={snapPoints}
                  backgroundStyle={styles.bottomSheet}
                  onChange={handleSheetChanges}
                  backdropComponent={renderBackdrop}
                  enablePanDownToClose={true}
                  onClose={handleSheetClose}
                  index={isBottomSheet ? 0 : -1}
                  enableContentPanningGesture={true}
                  enableHandlePanningGesture={true}
                  handleStyle={{
                     backgroundColor: currentTheme.bg_200,
                     borderTopLeftRadius: 15,
                     borderTopRightRadius: 15,
                  }}
                  enableBlurKeyboardOnGesture
                  enableOverDrag={false}
                  animateOnMount={true}
                  enableDynamicSizing={displayDynamicSizing}
                  maxDynamicContentSize={maxDynamicContentSize}
                  android_keyboardInputMode="adjustResize"
                  handleIndicatorStyle={styles.handleIndicator}
                  onAnimate={handleSheetAnimate}
                  keyboardBehavior="extend"
                  keyboardBlurBehavior="none"
                  handleComponent={() => (
                     <View
                        style={{
                           width: '100%',
                           height: 20,
                           alignItems: 'center',
                           justifyContent: 'center',
                           paddingTop: 8
                        }}
                        onTouchStart={() => {
                           userInitiatedSwipe.current = true;
                        }}
                     >
                        <View
                           style={{
                              width: 40,
                              height: 4,
                              backgroundColor: currentTheme.bg_400,
                              borderRadius: 2,
                           }}
                        />
                     </View>
                  )}
               >
                  <View
                     style={[
                        displayDynamicSizing ? { flex: 1 } : { flex: 1 },
                     ]}
                  >
                     {displayTitle && (
                        <View
                           style={styles.titleContainer}
                           onTouchStart={forceHideKeyboard}
                        >
                           {displayLeftBtn && (
                              <SimpleButtonUi
                                 onPress={() => {
                                    if (hasScreens && navGoBackRef.current) {
                                       navGoBackRef.current();
                                    } else if (leftBtnPress) {
                                       leftBtnPress();
                                    }
                                 }}
                              >
                                 {swipeBackBtnOpacity !== null ? (
                                    // Во время свайпа используем обычный View с числовым opacity
                                    <View
                                       style={[
                                          styles.topLeftBtn,
                                          { opacity: swipeBackBtnOpacity }
                                       ]}
                                    >
                                       <BackArrowLeftIcon
                                          height={15}
                                          width={10}
                                          color={currentTheme.primary_100}
                                       />
                                    </View>
                                 ) : (
                                    // В обычном режиме используем Animated.View
                                    <Animated.View
                                       style={[
                                          styles.topLeftBtn,
                                          { opacity }
                                       ]}
                                    >
                                       <BackArrowLeftIcon
                                          height={15}
                                          width={10}
                                          color={currentTheme.primary_100}
                                       />
                                    </Animated.View>
                                 )}
                              </SimpleButtonUi>
                           )}

                           {/* Анимированный тайтл при свайпе */}
                           {swipeTitleState ? (
                              <View style={styles.titleTextContainer}>
                                 {/* Текущий тайтл (уходит) */}
                                 <MainText
                                    px={16}
                                    tac='center'
                                    width={"100%"}
                                    style={{
                                       position: 'absolute',
                                       opacity: 1 - swipeTitleState.progress
                                    }}
                                 >
                                    {swipeTitleState.currentTitle || ''}
                                 </MainText>
                                 {/* Целевой тайтл (появляется) */}
                                 <MainText
                                    px={16}
                                    tac='center'
                                    width={"100%"}
                                    style={{
                                       opacity: swipeTitleState.progress
                                    }}
                                 >
                                    {swipeTitleState.targetTitle || ''}
                                 </MainText>
                              </View>
                           ) : (
                              <MainText
                                 px={16}
                                 tac='center'
                                 width={"100%"}
                              >
                                 {displayTitle}
                              </MainText>
                           )}
                           <View
                              ref={closeButtonRef}
                              style={styles.rightTopBtn}
                           >
                              {(menuItems && (menuItems?.length > 0)) && (
                                 <SimpleButtonUi
                                    onPress={handleOpenContextMenu}
                                    disabled={disabled}
                                 >
                                    <Ionicons
                                       name='filter'
                                       size={22}
                                       color={currentTheme.secondary_100}
                                    />
                                 </SimpleButtonUi>
                              )}
                           </View>
                        </View>
                     )}

                     {header && (
                        <BottomSheetView style={styles.headerContainer}>
                           {header}
                        </BottomSheetView>
                     )}

                     {hasScreens && screens && initialScreen ? (
                        <BottomSheetView
                           style={[
                              { marginTop: displayTitle ? 40 : 0 },
                              { paddingBottom: insets.bottom + INSETS_BOTTOM_SUMMARY },
                              showNavBackBtn ? styles.contentContainer : {}
                           ]}
                        >
                           <BottomSheetNavigator
                              screens={screens}
                              initialScreen={initialScreen}
                              onScreenChange={(screen) => {
                                 setNavTitle(screen.title);
                                 setSwipeTitleState(null);
                                 setSwipeBackBtnOpacity(null);
                              }}
                              onShowBackButton={setShowNavBackBtn}
                              onGoBackRef={(fn) => { navGoBackRef.current = fn; }}
                              onHeightChange={setNavContentHeight}
                              onSnapToHeightInstant={snapToHeightInstant}
                              bottomSheetBgColor={bottomSheetBgColor}
                              onTitleSwipeProgress={(currentTitle, targetTitle, progress) => {
                                 if (progress > 0) {
                                    setSwipeTitleState({ currentTitle, targetTitle, progress });
                                 }
                              }}
                              onBackButtonOpacity={(opacity) => {
                                 setSwipeBackBtnOpacity(opacity);
                              }}
                           />
                        </BottomSheetView>
                     ) : children && (
                        <BottomSheetView
                           style={[
                              displayDynamicSizing ? { marginTop: displayTitle ? 40 : 0 } : styles.contentContainer,
                              { paddingBottom: insets.bottom + INSETS_BOTTOM_SUMMARY }
                           ]}
                        >
                           {children}
                        </BottomSheetView>
                     )}
                  </View>
               </BottomSheet>

               {(contextMenuVisible && menuItems) && (
                  <ContextMenuUi
                     items={menuItems}
                     isVisible={contextMenuVisible}
                     onClose={handleCloseContextMenu}
                     anchorRef={closeButtonRef}
                     width={180}
                     offset={{ x: -155, y: 5 }}
                     selected={null}
                  />
               )}

               {isBottomSheet && footerVisible && footer && (
                  <Animated.View
                     style={[
                        {
                           position: 'absolute',
                           bottom: keyboardHeight,
                           left: 0,
                           right: 0,
                           backgroundColor: currentTheme.bg_200,
                           borderTopWidth: 1,
                           borderTopColor: changeRgbA(currentTheme.secondary_100, "0.1"),
                           zIndex: 2000,
                           paddingBottom: keyboardVisible ? 3 : (Platform.OS === 'ios' ? 30 : 10),
                        },
                        {
                           opacity: footerAnimation,
                           transform: [
                              {
                                 translateY: footerAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0],
                                 }),
                              },
                           ],
                        },
                        footerStyle
                     ]}
                  >
                     {footer}
                  </Animated.View>
               )}
            </GestureHandlerRootView>
         </View>
      </Portal>
   );
});

const createBottomSheetStyles = ({ bg200, bg400, secondary100, bottomSheetBgColor, hasHeader }: CreateStylesParams) => StyleSheet.create({
   topLeftBtn: {
      position: "absolute",
      top: -3,
      bottom: 0,
      left: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
   },
   rightTopBtn: {
      position: "absolute",
      right: 15
   },
   container: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      zIndex: 9999,
      elevation: 9999
   },
   contentContainer: {
      flex: 1,
      height: "100%"
   },
   bottomSheet: {
      backgroundColor: bottomSheetBgColor || bg200,
      shadowColor: changeRgbA(bottomSheetBgColor || bg200, "0.5"),
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
   },
   headerContainer: {
      paddingBottom: hasHeader ? 12 : 0,
   },
   footerContainer: {
      borderTopWidth: 1,
      borderTopColor: changeRgbA(secondary100, "0.1"),
      paddingVertical: 16,
      paddingHorizontal: 16,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: bg200,
      zIndex: 9999,
      elevation: 10,
   },
   gestureRoot: {
      flex: 1,
   },
   handleIndicator: {
      backgroundColor: bg400,
      width: 40,
      borderRadius: 2,
   },
   titleContainer: {
      flexDirection: 'row',
      justifyContent: "center",
      alignItems: 'center',
      paddingTop: 10,
   },
   titleTextContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
   },
   keyboardAvoidingView: {
      flex: 1,
   },
   mainContainer: {
      flex: 1,
      position: 'relative',
   },
   commentInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: changeRgbA(secondary100, "0.1"),
      backgroundColor: bg200,
   },
   commentInput: {
      flex: 1,
      padding: 10,
      borderRadius: 20,
      backgroundColor: changeRgbA(secondary100, "0.05"),
      marginRight: 10,
   },
   sendButton: {
      padding: 8,
   },
});