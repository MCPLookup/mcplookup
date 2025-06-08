"use client"

import { Menu as ChakraMenu, Portal } from "@chakra-ui/react"
import * as React from "react"

export interface MenuRootProps extends ChakraMenu.RootProps {}
export interface MenuTriggerProps extends ChakraMenu.TriggerProps {}
export interface MenuContentProps extends ChakraMenu.ContentProps {}
export interface MenuItemProps extends ChakraMenu.ItemProps {}
export interface MenuSeparatorProps extends ChakraMenu.SeparatorProps {}

export const MenuRoot = React.forwardRef<HTMLDivElement, MenuRootProps>(
  function MenuRoot(props, ref) {
    return <ChakraMenu.Root {...props} />
  }
)

export const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(
  function MenuTrigger(props, ref) {
    return <ChakraMenu.Trigger ref={ref} {...props} />
  }
)

export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  function MenuContent(props, ref) {
    return (
      <Portal>
        <ChakraMenu.Positioner>
          <ChakraMenu.Content ref={ref} {...props} />
        </ChakraMenu.Positioner>
      </Portal>
    )
  }
)

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    return <ChakraMenu.Item ref={ref} {...props} />
  }
)

export const MenuSeparator = React.forwardRef<HTMLDivElement, MenuSeparatorProps>(
  function MenuSeparator(props, ref) {
    return <ChakraMenu.Separator ref={ref} {...props} />
  }
)

// Export as namespace for dot notation usage
export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Separator: MenuSeparator,
}
