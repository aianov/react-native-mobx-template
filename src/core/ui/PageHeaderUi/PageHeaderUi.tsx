import { BackArrowLeftIcon } from '@icons/Ui/BackArrowLeftIcon';
import { logger } from '@lib/helpers';
import { goBack, useNavigation } from '@lib/navigation';
import { formatDiffData } from '@lib/text';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlexAlignType, GestureResponderEvent, LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '../BoxUi/Box';
import { LoaderUi } from '../LoaderUi/LoaderUi';
import { MainText } from '../MainText/MainText';
import { SimpleButtonUi } from '../SimpleButtonUi/SimpleButtonUi';

interface PageHeaderUiProps {
   text?: string;
   style?: StyleProp<ViewStyle>;
   cancelText?: string | null;
   leftJsx?: ReactNode | null;
   rightJsx?: ReactNode | null;
   midJsx?: ReactNode | null;
   Component?: any;
   intensity?: number;
   rightTop?: number;
   leftTop?: number;
   isBlurView?: boolean;
   wrapperJustifyContent?: FlexAlignType;
   height?: number;
   loading?: "nointernet" | "pending" | "fulfilled" | "error";
   icon?: ReactNode;
   withoutBackBtn?: boolean;
   midPress?: () => void;
   onlyLayout?: boolean;
}

export const PageHeaderUi = observer(({
   text = "PageHeaderUi",
   style = {},
   withoutBackBtn = false,
   cancelText = null,
   Component = View,
   rightTop = 0,
   leftTop = 0,
   leftJsx = null,
   midPress,
   intensity = 30,
   loading,
   midJsx = null,
   icon,
   isBlurView = false,
   wrapperJustifyContent = "flex-start",
   height = 30,
   rightJsx = null,
   onlyLayout = false,
}: PageHeaderUiProps) => {
   const { currentTheme } = themeStore;

   console.log('[page header ui]:', loading);
   const [headerHeight, setHeaderHeight] = useState(0);

   const { t } = useTranslation();
   const navigation = useNavigation();
   const insets = useSafeAreaInsets();
   const { width } = useWindowDimensions();

   const onBackPress = (event: GestureResponderEvent) => {
      event.preventDefault();
      event.stopPropagation();
      // TODO: ФИКСАНУТЬ goback 
      logger.debug("onBackPress", `go back to - ${formatDiffData(navigation)}`);
      goBack();

      // navigation.goBack();
   };
   const onHeaderLayout = (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setHeaderHeight(height);
   };

   if (onlyLayout) {
      return (
         <Component
            style={[
               s.header,
               {
                  borderBottomColor: currentTheme.border_100,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: insets.top * 1.65,
                  zIndex: 100,
                  alignItems: "flex-end",
                  backgroundColor: isBlurView ? currentTheme.bg_100 : undefined,
                  top: insets.top * 1.65,
               },
               style,
            ]}
            onLayout={onHeaderLayout}
            intensity={intensity}
         >
            <View
               style={[
                  s.wrapper,
                  {
                     minWidth: width,
                     justifyContent: wrapperJustifyContent as any,
                     height,
                  }
               ]}
            >
               {!withoutBackBtn && (
                  <SimpleButtonUi
                     onPress={onBackPress}
                     style={[
                        s.backButton,
                        { top: leftTop, zIndex: 10 },
                     ]}
                  >
                     <BackArrowLeftIcon
                        height={20}
                        width={12.5}
                        color={currentTheme.primary_100}
                     />
                     {leftJsx && leftJsx}
                  </SimpleButtonUi>
               )}

               {rightJsx && (
                  <View
                     style={[
                        s.right,
                        { top: rightTop }
                     ]}
                  >
                     {rightJsx}
                  </View>
               )}
            </View>
         </Component>
      );
   }

   return (
      <Component
         style={[
            s.header,
            {
               borderBottomColor: currentTheme.border_100,
               left: 0,
               right: 0,
               height: insets.top + height,
               zIndex: 100,
               backgroundColor: isBlurView ? currentTheme.bg_100 : undefined,
            },
            style,
         ]}
         onLayout={onHeaderLayout}
         intensity={intensity}
      >
         <Box
            height={insets.top}
            width={"100%"}
         />

         <Box
            style={[
               s.wrapper,
               {
                  minWidth: width,
                  justifyContent: wrapperJustifyContent as any,
                  height: "100%"
               }
            ]}
            fD="row"
            align="center"
            justify='center'
         >
            {!withoutBackBtn && (
               <SimpleButtonUi
                  onPress={onBackPress}
                  style={[
                     s.backButton,
                     { top: leftTop, zIndex: 10 },
                     { height: "100%" }
                  ]}
               >
                  <BackArrowLeftIcon
                     height={20}
                     width={12.5}
                     color={currentTheme.primary_100}
                  />
                  {leftJsx && leftJsx}
               </SimpleButtonUi>
            )}

            {midJsx ? (
               <Box
                  height={"100%"}
                  width={"100%"}
                  align='center'
                  justify='center'
               >
                  {midJsx}
               </Box>
            ) : (
               <Box
                  width={"100%"}
                  fD='row'
                  gap={5}
                  align='center'
                  justify='center'
               >
                  {(loading == 'pending' || loading == 'nointernet' || loading == "error") ? (
                     <>
                        <LoaderUi
                           color={currentTheme.text_100}
                           size={"small"}
                        />
                        <MainText
                           tac='center'
                           numberOfLines={1}
                           ellipsizeMode="tail"
                           fontWeight='bold'
                           px={17}
                        >
                           {loading == "error" ? t("chats_error") : loading == "nointernet" ? t("chats_nointernet") : t("chats_pending")}
                        </MainText>
                     </>
                  ) : (
                     <>
                        <MainText
                           tac='center'
                           fontWeight='bold'
                           numberOfLines={1}
                           ellipsizeMode="tail"
                           px={17}
                           style={{ maxWidth: "75%" }}
                        >
                           {text}
                        </MainText>
                        {icon && icon}
                     </>
                  )}
               </Box>
            )}

            {rightJsx && (
               <Box
                  style={[
                     s.right,
                     { top: rightTop }
                  ]}
                  height={"100%"}
                  centered
               >
                  {rightJsx}
               </Box>
            )}
         </Box>
      </Component>
   );
});

const s = StyleSheet.create({
   header: {
      borderBottomWidth: 0.1,
      position: 'relative',
   },
   wrapper: {
      justifyContent: "flex-start",
      flex: 1,
   },
   headerRight: {
      width: 20,
   },
   backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: "absolute",
      gap: 15,
      paddingVertical: 5,
      left: 15,
   },
   right: {
      position: 'absolute',
      right: 15,
      alignItems: 'center',
      justifyContent: 'center',
   }
});