import { Container } from "@/components/Container";
import { items } from "@/lib/mock";
import { colors, layout } from "@/lib/theme";
import React from "react";
import {
  ListRenderItemInfo,
  StyleSheet,
  Text
} from "react-native";
import Animated, { SharedValue, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

type ItemType = (typeof items)[0];

export function Interpolation() {
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x / (layout.itemSize + layout.spacing);
    }
  })

  return (
    <Container style={styles.container}>
      <Animated.FlatList
        onScroll={onScroll}
        scrollEventThrottle={16.67}
        // or
        // scrollEventThrottle={1000 / 60}
        // 60 times per second
        data={items}
        horizontal
        contentContainerStyle={{
          gap: layout.spacing,
          // We are creating horizontal spacing to align the list in the center
          // We don't subtract the spacing here because gap is not applied to the
          // first item on the left and last item on the right.
          paddingHorizontal: (layout.screenWidth - layout.itemSize) / 2,
        }}
        // We can't use pagingEnabled because the item is smaller than the viewport width
        // in our case itemSize and we add the spacing because we have the gap
        // added between the items in the contentContainerStyle
        snapToInterval={layout.itemSize + layout.spacing}
        // This is to snap faster to the closest item
        decelerationRate={"fast"}
        renderItem={(props) => <Item {...props} scrollX={scrollX} />}
        initialScrollIndex={1}
        getItemLayout={(_, index) => ({
          length: layout.itemSize + layout.spacing,
          offset: (layout.itemSize + layout.spacing) * index,
          index,
        })}
      />
    </Container>
  );
}

type ItemProps = ListRenderItemInfo<ItemType> & { 
  scrollX: SharedValue<number>;
};

export function Item({ item, index, scrollX }: ItemProps) {
  const stylez = useAnimatedStyle(() => {
    return {
      // opacity: interpolate(
      //   scrollX.value,
      //   [index - 1, index, index + 1],
      //   [0.75, 1, 0.75]
      // )
      backgroundColor: interpolateColor(
        scrollX.value,
        [index - 1, index, index + 1],
        [colors.purple, colors.overlay, colors.green]
      ),
      transform: [
        {
          scale: interpolate(
            scrollX.value,
            [index - 1, index, index + 1],
            [0.9, 1, 0.9]
          ),
        }
      ]
    };
  });

  return (
    <Animated.View style={[styles.item, stylez]}>
      <Text>{item.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: {
    width: layout.itemSize,
    height: layout.itemSize * 1.67,
    borderRadius: layout.radius,
    justifyContent: "flex-end",
    padding: layout.spacing,
    backgroundColor: colors.overlay,
  },
  container: {
    padding: 0,
  },
});
