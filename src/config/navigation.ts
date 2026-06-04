import type { LucideIcon } from 'lucide-react'
import {
	BookOpen,
	CalendarDays,
	Clapperboard,
	Crosshair,
	Monitor,
	Package,
	ScrollText,
} from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

export const NAVIGATION_CONFIG: NavigationItem[] = [
	{
		key: 'date',
		path: '/date',
		icon: CalendarDays,
		isContentType: true,
	},
	{
		key: 'platforms',
		path: '/platforms',
		icon: Monitor,
		isContentType: true,
	},
	{
		key: 'trailer',
		path: '/trailer',
		icon: Clapperboard,
		isContentType: true,
	},
	{
		key: 'guide',
		path: '/guide',
		icon: BookOpen,
		isContentType: true,
	},
	{
		key: 'combat',
		path: '/combat',
		icon: Crosshair,
		isContentType: true,
	},
	{
		key: 'story',
		path: '/story',
		icon: ScrollText,
		isContentType: true,
	},
	{
		key: 'editions',
		path: '/editions',
		icon: Package,
		isContentType: true,
	},
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES: string[] = NAVIGATION_CONFIG
	.filter((item) => item.isContentType)
	.map((item) => item.key)

export type ContentType = string

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
