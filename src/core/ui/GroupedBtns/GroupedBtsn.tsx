import { GroupBtnsType } from '@core/config/types';
import { Box, LiveTimeAgo, MainText, SecondaryText, SimpleButtonUi } from '@core/ui';
import { navigate } from '@lib/navigation';
import { numericId } from '@lib/numbers';
import { changeRgbA } from '@lib/theme';
import { themeStore } from '@theme/stores';
import { observer } from 'mobx-react-lite';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleProp, StyleSheet, View, ViewProps } from 'react-native';

interface GroupedBtnsProps {
   items: GroupBtnsType[];
   groupGap?: number;
   wrapperStyle?: StyleProp<ViewProps>;
   groupBg?: string | number | undefined;
   leftFlex?: number | undefined;
   debug?: boolean;
}

export const GroupedBtns = observer(({
   items,
   groupGap = 15,
   wrapperStyle = {},
   leftFlex = 1,
   groupBg = themeStore.currentTheme.bg_200,
   debug = false
}: GroupedBtnsProps) => {
   const { currentTheme } = themeStore;

   const { t } = useTranslation();

   const onBtnPress = (item: GroupBtnsType) => {
      if (item.callback) {
         item.callback(item, t);
         return;
      }
      if (!item.url) return;
      navigate(item.url);
   };

   return (
      <Box
         style={[
            s.wrapper,
            {
               gap: groupGap,
               width: "100%",
               height: "auto",
               flex: 0
            },
            wrapperStyle,
         ]}
         debug={debug}
      >
         {(() => {
            const groupedSettings = items.reduce((acc, current) => {
               const lastGroup = acc[acc.length - 1];

               if (!lastGroup || lastGroup[0].group !== current.group) {
                  acc.push([current]);
               } else {
                  lastGroup.push(current);
               }

               return acc;
            }, [] as typeof items[]);

            return groupedSettings.map((group, groupIndex) => (
               <Box
                  key={`${groupIndex}-${numericId()}`}
                  fD='column'
                  gap={3}
                  width={"100%"}
               >
                  {group[0].groupTitle && (
                     <SecondaryText
                        px={group[0].groupTitlePx || 15}
                        ml={10}
                        mb={1}
                     >
                        {group[0].groupTitle.toUpperCase()}
                     </SecondaryText>
                  )}

                  <Box
                     style={[
                        s.groupContainer,
                        {
                           backgroundColor: groupBg as string,
                           width: "100%",
                        },
                     ]}
                     bRad={currentTheme.radius_400}
                  >
                     {group.map((t, i) => {
                        const ifLast = i === group.length - 1;

                        return (
                           <Fragment key={`${i}-${t.text}`}>
                              <SimpleButtonUi
                                 onPress={() => onBtnPress(t)}
                                 width={"100%"}
                                 disabled={!__DEV__ && t.btnDisabled}
                                 style={{
                                    opacity: t.btnDisabled ? 0.5 : 1,
                                 }}
                              >
                                 <Box
                                    fD='row'
                                    justify='space-between'
                                    align='center'
                                    width={"100%"}
                                 >
                                    {t.icon && (
                                       <Box
                                          style={[
                                             s.btnLeft,
                                             {
                                                alignItems: "center",
                                                justifyContent: "center",
                                                height: "100%",
                                                paddingVertical: (t.btnRightPaddingVertical || 0) + 4 || 0
                                             },
                                             t.btnLeftStyle || {}
                                          ]}
                                       >
                                          {t.icon}
                                       </Box>
                                    )}

                                    <Box
                                       style={[
                                          s.btnRight,
                                          {
                                             paddingLeft: t.icon ? 0 : 20,
                                             height: t.height || "auto",
                                             minHeight: t.minHeight || undefined,
                                             paddingVertical: t.btnRightPaddingVertical || 0
                                          },
                                          ifLast ? {} : {
                                             borderBottomWidth: 0.2,
                                             borderBottomColor: changeRgbA(currentTheme.secondary_100, "0.3")
                                          }
                                       ]}
                                       fD="row"
                                       width={"100%"}
                                    >
                                       <Box
                                          // flex={leftFlex}
                                          fD="row"
                                          width={"100%"}
                                          justify="space-between"
                                          flex={1}
                                       >
                                          <Box
                                             gap={t.btnRightGap || 0}
                                             flex={1}
                                          >
                                             <Box
                                                centered
                                                flex={1}
                                             >
                                                <MainText
                                                   numberOfLines={1}
                                                   mR={5}
                                                   color={t.textColor ? t.textColor : undefined}
                                                   px={t.btnRightMainTextPx || 18}
                                                >
                                                   {t.text}
                                                </MainText>
                                             </Box>

                                             {t.pretitle && (
                                                <MainText
                                                   numberOfLines={t.pretitleLines || 1}
                                                   ellipsizeMode='tail'
                                                   px={t.pretitlePx || 13}
                                                   style={t.pretitleStyle}
                                                >
                                                   {t.pretitle}
                                                </MainText>
                                             )}

                                             {t.subtitle && (
                                                <Box
                                                   align='center'
                                                   fD='row'
                                                   flex={1}
                                                >
                                                   {typeof t.subtitle == "string" ? (
                                                      <SecondaryText
                                                         px={t.btnRightSubtitlePx || 13}
                                                         numberOfLines={t.subtitleLines == "auto" ? undefined : t.subtitleLines || 1}
                                                         ellipsizeMode='tail'
                                                      >
                                                         {t.subtitle}
                                                      </SecondaryText>
                                                   ) : t.subtitle}

                                                   {t.subtitleRealTimeDate && (
                                                      <LiveTimeAgo
                                                         date={t.subtitleRealTimeDate}
                                                         fontSize={12}
                                                      />
                                                   )}
                                                </Box>
                                             )}
                                          </Box>

                                          {(t?.leftIcon || !t.icon || t.leftText) && (
                                             <Box
                                                style={{ paddingRight: 15 }}
                                                align='flex-end'
                                             >
                                                <Box
                                                   fD='row'
                                                   align='center'
                                                   justify='center'
                                                   flex={1}
                                                >
                                                   {t.leftText && (
                                                      <SecondaryText
                                                         numberOfLines={1}
                                                         ellipsizeMode='tail'
                                                         style={t.leftTextColor ? { color: t.leftTextColor } : {}}
                                                         px={18}
                                                      >
                                                         {t.leftText}
                                                      </SecondaryText>
                                                   )}
                                                   {typeof t.leftIcon == "function" ? (
                                                      <>
                                                         {t.actionKey && t.leftIcon()}
                                                      </>
                                                   ) : (
                                                      <Box
                                                         centered
                                                         style={{ marginLeft: 10 }}
                                                      >
                                                         {t.leftIcon}
                                                      </Box>
                                                   )}
                                                </Box>
                                             </Box>
                                          )}
                                       </Box>
                                    </Box>
                                 </Box>

                                 {t.btn && (
                                    <SimpleButtonUi
                                       style={s.btn}
                                       key={`${t.group}-${i}`}
                                       onPress={t.btn.btnCallback}
                                       disabled={t.btnDisabled}
                                    >
                                       {t.btn.btnIcon && (
                                          <View
                                             style={[
                                                s.btnLeft,
                                                {
                                                   paddingBottom: i == group.length - 1 ? 0 : 7,
                                                   alignItems: "center",
                                                   justifyContent: "center",
                                                   // paddingTop: t.rowGap || 7
                                                }
                                             ]}
                                          >
                                             {t.btn.btnIcon}
                                          </View>
                                       )}

                                       <View
                                          style={[
                                             s.btnRight,
                                             {
                                                paddingVertical: t.rowGap || 7,
                                                borderTopWidth: 0.2,
                                                borderTopColor: changeRgbA(currentTheme.secondary_100, "0.3"),
                                             },
                                          ]}
                                       >
                                          <Box
                                             style={{ maxWidth: "85%" }}
                                          >
                                             <MainText
                                                numberOfLines={1}
                                                ellipsizeMode='tail'
                                                color={t.btn.btnColor}
                                             >
                                                {t.btn.btnText}
                                             </MainText>
                                          </Box>
                                       </View>
                                    </SimpleButtonUi>
                                 )}
                              </SimpleButtonUi>
                           </Fragment>
                        );
                     })}
                  </Box>
                  {group[0].endGroupTitle && (
                     <SecondaryText
                        px={group[0].endGroupTitlePx || 14}
                        ml={10}
                        mt={3}
                     >
                        {group[0].endGroupTitle}
                     </SecondaryText>
                  )}
               </Box>
            ));
         })()}
      </Box>
   );
});

const s = StyleSheet.create({
   wrapper: {
      flex: 1,
      flexDirection: 'column',
      gap: 15
   },
   btnRight: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: "100%",
      flex: 1
   },
   btnLeft: {
      flexDirection: "row",
      gap: 8,
      width: 65,
      alignItems: "center",
      justifyContent: "center",
   },
   btn: {
      flexDirection: 'row',
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
   },
   groupContainer: {
      overflow: "hidden",
      flexDirection: 'column',
      paddingVertical: 1
   },
   safeArea: {
      flex: 1,
      backgroundColor: themeStore.currentTheme.bg_200,
   },
   container: {
      flex: 1,
   },
});