# -*- coding: utf-8 -*-
"""
校园失物招领 · 小程序交互原型 v1
福州大学旗山校区 · 软件工程第一次结对作业

说明:
  - 依据同目录下的设计稿(gif / png / pdf)还原全部页面与交互:
      首页、信息列表、搜索页、信息详情、发布页、校园地图、消息中心、个人主页
  - 运行方式:  python v1.py
  - 依赖:     仅 Python 标准库(tkinter)。
              map_full.png / map_small.png 为校园地图素材(来自设计稿嵌入图片),
              缺失时会自动绘制简易示意地图,不影响运行。
"""

import os
import time
import tkinter as tk
from tkinter import font as tkfont

# ============================================================
# 主题配色(取自设计稿采样: 主色绿色, 寻物橙色, 浅色背景)
# ============================================================
C_BG       = "#F5F5F5"   # 页面背景
C_CARD     = "#FFFFFF"   # 卡片
C_LINE     = "#E7E9EC"   # 分割线
C_TXT      = "#17181B"   # 主文字
C_SUB      = "#878E97"   # 次要文字
C_GRAY_BG  = "#EFF1F3"   # 输入框/浅灰底
C_INACTIVE = "#9AA0A6"   # 未选中导航
C_GREEN    = "#4F8E6E"   # 主色(招领/按钮)
C_GREEN_D  = "#35775B"   # 深绿(浅底上的文字)
C_GREEN_BG = "#E9F3EC"   # 浅绿底
C_ORANGE   = "#D07050"   # 寻物橙
C_ORANGE_D = "#B85C3C"
C_ORANGE_BG= "#FBEDE6"
C_DARK     = "#2A2E37"   # 手机外框

PAD = 16                  # 内容左右边距
CW  = 358                 # 内容宽度 390 - 32


def F(sz, bold=False):
    return ("Microsoft YaHei UI", int(sz), "bold" if bold else "normal")


def shade(hexc, delta):
    r = max(0, min(255, int(hexc[1:3], 16) + delta))
    g = max(0, min(255, int(hexc[3:5], 16) + delta))
    b = max(0, min(255, int(hexc[5:7], 16) + delta))
    return "#%02X%02X%02X" % (r, g, b)


def rrect(cv, x1, y1, x2, y2, r, **kw):
    """圆角矩形"""
    r = max(1, min(r, (x2 - x1) / 2, (y2 - y1) / 2))
    pts = [x1 + r, y1, x2 - r, y1, x2, y1, x2, y1 + r, x2, y2 - r, x2, y2,
           x2 - r, y2, x1 + r, y2, x1, y2, x1, y2 - r, x1, y1 + r, x1, y1]
    return cv.create_polygon(pts, smooth=True, **kw)


def clip(cv, text, font_, maxw):
    """按像素宽度截断文字并加省略号"""
    f = tkfont.Font(font=font_)
    if f.measure(text) <= maxw:
        return text
    while text and f.measure(text + "…") > maxw:
        text = text[:-1]
    return text + "…"


def V(page, x1, y1, x2, y2, cb):
    """注册内容区可点击区域"""
    page.views.append((x1, y1, x2, y2, cb))


def Vt(page, x1, y1, x2, y2, cb):
    """注册顶部条可点击区域"""
    page.tviews.append((x1, y1, x2, y2, cb))


def Vf(page, x1, y1, x2, y2, cb):
    """注册底部条可点击区域"""
    page.fviews.append((x1, y1, x2, y2, cb))


# ============================================================
# 数据
# ============================================================
CATEGORIES = ["校园卡证件", "数码电子", "钥匙", "书籍文具",
              "水杯雨伞", "衣物配饰", "其他"]
CAT_EMOJI = {"校园卡证件": "🪪", "数码电子": "🎧", "钥匙": "🔑",
             "书籍文具": "📚", "水杯雨伞": "☂", "衣物配饰": "🧥", "其他": "📦"}
KIND_FULL = {"寻物": "寻物启事（物品丢失，寻求线索）",
             "招领": "失物招领（物品等待失主认领）"}

LOCATIONS = ["图书馆", "京元餐厅", "丁香园", "第一田径场", "第二田径场",
             "游泳馆", "宏晖文体馆", "南门快递中心", "素拓中心", "西三教学楼",
             "东三教学楼", "宿舍区停车棚"]
MAP_LOCS  = LOCATIONS[:10]          # 地图页"高频遗失地点"
TIME_OPTIONS = ["今天上午", "今天中午", "今天下午", "昨天", "2天前", "3天前", "更早"]
HOT_SEARCHES = [("校园卡", 128), ("雨伞", 96), ("耳机", 74),
                ("钥匙", 63), ("保温杯", 41), ("眼镜", 35)]

# 列表顺序与设计稿一致
ITEMS = [
    {"title": "黑色折叠伞一把", "emoji": "☂", "kind": "招领", "category": "水杯雨伞",
     "location": "京元餐厅一楼门口", "time": "20分钟前", "status": "进行中",
     "lost": "今天中午", "published": "20分钟前",
     "desc": "在京元餐厅一楼门口捡到一把黑色折叠伞，伞柄有轻微磨损，请失主尽快联系认领。",
     "publisher": "王同学", "dept": "土木工程学院", "contact": "13812345601", "mine": False},
    {"title": "校园卡（尾号2076）", "emoji": "🪪", "kind": "寻物", "category": "校园卡证件",
     "location": "图书馆三楼文科书库", "time": "1小时前", "status": "进行中",
     "lost": "今天上午", "published": "1小时前",
     "desc": "在图书馆三楼文科书库自习时不小心遗失校园卡，卡号尾号2076，希望捡到的同学联系我，万分感谢！",
     "publisher": "我", "dept": "经济与管理学院", "contact": "13812345602", "mine": True},
    {"title": "AirPods Pro 2 耳机", "emoji": "🎧", "kind": "寻物", "category": "数码电子",
     "location": "第一田径场看台", "time": "2小时前", "status": "进行中",
     "lost": "9月25日 傍晚", "published": "2小时前",
     "desc": "傍晚在第一田径场跑步后丢失，白色充电盒，盒身有轻微划痕，里面有左耳和右耳，对我很重要，必有重谢！",
     "publisher": "赵同学", "dept": "体育教学部", "contact": "13812345603", "mine": False},
    {"title": "一串钥匙（小熊挂件）", "emoji": "🔑", "kind": "招领", "category": "钥匙",
     "location": "西三教学楼 203 教室", "time": "3小时前", "status": "进行中",
     "lost": "今天上午", "published": "3小时前",
     "desc": "在西三教学楼203教室捡到一串钥匙，挂有小熊毛绒挂件，请失主提供钥匙数量等信息后认领。",
     "publisher": "刘同学", "dept": "计算机与大数据学院", "contact": "13812345604", "mine": False},
    {"title": "蓝色象印保温杯", "emoji": "🥤", "kind": "招领", "category": "水杯雨伞",
     "location": "宏晖文体馆羽毛球区", "time": "昨天", "status": "进行中",
     "lost": "昨天下午", "published": "昨天",
     "desc": "宏晖文体馆羽毛球区捡到一个蓝色象印保温杯，杯身贴有卡通贴纸，请失主联系认领。",
     "publisher": "陈同学", "dept": "电气工程与自动化学院", "contact": "13812345605", "mine": False},
    {"title": "黑框近视眼镜", "emoji": "👓", "kind": "招领", "category": "其他",
     "location": "丁香园食堂二楼", "time": "5小时前", "status": "进行中",
     "lost": "今天中午", "published": "5小时前",
     "desc": "丁香园食堂二楼餐桌上捡到黑框近视眼镜一副，配有深蓝色眼镜盒，请失主联系认领。",
     "publisher": "林同学", "dept": "化学学院", "contact": "13812345606", "mine": False},
    {"title": "高等数学（第七版）上册", "emoji": "📚", "kind": "招领", "category": "书籍文具",
     "location": "东三教学楼 105 自习室", "time": "2天前", "status": "进行中",
     "lost": "2天前", "published": "2天前",
     "desc": "东三教学楼105自习室捡到一本高等数学（第七版）上册，封面写有班级信息，请失主联系认领。",
     "publisher": "郑同学", "dept": "机械工程及自动化学院", "contact": "13812345607", "mine": False},
    {"title": "浅蓝色自动雨伞", "emoji": "☂", "kind": "招领", "category": "水杯雨伞",
     "location": "南门快递中心门口", "time": "3天前", "status": "已完成",
     "lost": "3天前", "published": "3天前",
     "desc": "在南门快递中心门口捡到浅蓝色自动雨伞一把，现已联系到失主并归还，感谢大家的关注。",
     "publisher": "我", "dept": "经济与管理学院", "contact": "13812345608", "mine": True},
    {"title": "粉色自行车钥匙", "emoji": "🔑", "kind": "寻物", "category": "钥匙",
     "location": "区学生宿舍停车棚", "time": "3天前", "status": "进行中",
     "lost": "3天前", "published": "3天前",
     "desc": "在宿舍区停车棚附近遗失粉色自行车钥匙一把，钥匙圈上挂有星座挂坠，找到的同学请联系我，谢谢！",
     "publisher": "吴同学", "dept": "外国语学院", "contact": "13812345609", "mine": False},
]

MESSAGES = [
    {"emoji": "💬", "tint": C_GREEN_BG,
     "title": "有人对你的「校园卡（尾号2076）」发起了联系",
     "body": "对方称在图书馆三楼见过相似卡片，点击查看", "time": "2分钟前"},
    {"emoji": "✅", "tint": C_GREEN_BG,
     "title": "你发布的「浅蓝色自动雨伞」已标记完成",
     "body": "物品已归还，感谢你的善举", "time": "昨天"},
    {"emoji": "📢", "tint": C_ORANGE_BG,
     "title": "京元餐厅有一条新的招领信息",
     "body": "可能与你关注的物品有关，点击查看", "time": "2天前"},
    {"emoji": "🏠", "tint": "#E8EEF6",
     "title": "欢迎使用校园失物招领",
     "body": "发布寻物 / 招领信息，让失物更快回家", "time": "3天前"},
]


# ============================================================
# 基础控件
# ============================================================
class Btn:
    """圆角按钮"""
    def __init__(self, page, x, y, w, h, text, cb, bg=C_GREEN, fg="#FFFFFF",
                 font_=F(13, True), radius=None, outline=None):
        self.page = page
        self.cv, self.x, self.y, self.w, self.h = page.body, x, y, w, h
        self.text, self.cb, self.bg, self.fg = text, cb, bg, fg
        self.font, self.outline = font_, outline
        self.radius = radius if radius is not None else h / 2
        self.ids = []
        self.draw()
        V(page, x, y, x + w, y + h, self._click)

    def draw(self, bg=None, fg=None):
        for i in self.ids:
            self.cv.delete(i)
        self.ids = [rrect(self.cv, self.x, self.y, self.x + self.w, self.y + self.h,
                          self.radius, fill=bg or self.bg,
                          outline=self.outline or bg or self.bg, width=1.6),
                    self.cv.create_text(self.x + self.w / 2, self.y + self.h / 2,
                                        text=self.text, font=self.font, fill=fg or self.fg)]

    def _click(self):
        self.draw(shade(self.bg, -16))
        self.page.app.root.after(90, self.draw)
        self.cb()


class ChipBtn:
    """胶囊选择按钮"""
    def __init__(self, page, x, y, w, h, text, cb, selected=False, emoji=None,
                 bg="#FFFFFF", fg=C_TXT, bg_sel=C_GREEN_BG, fg_sel=C_GREEN_D,
                 outline_sel=C_GREEN):
        self.cv, self.x, self.y, self.w, self.h = page.body, x, y, w, h
        self.text, self.cb, self.sel, self.emoji = text, cb, selected, emoji
        self.bg, self.fg = bg, fg
        self.bg_sel, self.fg_sel, self.outline_sel = bg_sel, fg_sel, outline_sel
        self.ids = []
        self.draw()
        V(page, x, y, x + w, y + h, self._click)

    def draw(self):
        for i in self.ids:
            self.cv.delete(i)
        cy = self.y + self.h / 2
        if self.sel:
            self.ids = [rrect(self.cv, self.x, self.y, self.x + self.w, self.y + self.h,
                              self.h / 2, fill=self.bg_sel, outline=self.outline_sel, width=1.4)]
            fill = self.fg_sel
        else:
            self.ids = [rrect(self.cv, self.x, self.y, self.x + self.w, self.y + self.h,
                              self.h / 2, fill=self.bg, outline=C_LINE, width=1)]
            fill = self.fg
        tw = tkfont.Font(font=F(11)).measure(self.text)
        total = (18 if self.emoji else 0) + tw
        cx0 = self.x + (self.w - total) / 2
        if self.emoji:
            self.ids.append(self.cv.create_text(cx0, cy, text=self.emoji, font=F(12), anchor="w"))
            cx0 += 18
        self.ids.append(self.cv.create_text(cx0, cy, text=self.text, font=F(11), fill=fill, anchor="w"))

    def set(self, sel):
        self.sel = sel
        self.draw()

    def _click(self):
        self.cb()


class SegTabs:
    """分段选择器(全部 / 招领 / 寻物 等)"""
    def __init__(self, page, x, y, w, h, options, cur, on_change):
        self.page = page
        self.cv, self.x, self.y, self.w, self.h = page.body, x, y, w, h
        self.options, self.cur, self.on_change = options, cur, on_change
        self.ids = []
        self.redraw()

    def redraw(self):
        for i in self.ids:
            self.cv.delete(i)
        self.ids = [rrect(self.cv, self.x, self.y, self.x + self.w, self.y + self.h,
                          self.h / 2, fill=C_GRAY_BG, outline="")]
        n = len(self.options)
        sw = self.w / n
        for i, opt in enumerate(self.options):
            x0 = self.x + i * sw
            if i == self.cur:
                self.ids.append(rrect(self.cv, x0 + 2, self.y + 2, x0 + sw - 2,
                                      self.y + self.h - 2, self.h / 2 - 1,
                                      fill="#FFFFFF", outline=""))
                self.ids.append(self.cv.create_text(x0 + sw / 2, self.y + self.h / 2,
                                                    text=opt, font=F(11), fill=C_GREEN_D))
            else:
                self.ids.append(self.cv.create_text(x0 + sw / 2, self.y + self.h / 2,
                                                    text=opt, font=F(11), fill=C_SUB))
            V(self.page, x0, self.y, x0 + sw, self.y + self.h, lambda i=i: self.set(i))

    def set(self, i):
        self.cur = i
        self.redraw()
        self.on_change(i)


class Field:
    """画布上的输入框(Entry / Text),带占位文字,值保存在 data[key]"""
    def __init__(self, page, x, y, w, h, key, ph, data, multiline=False, on_change=None):
        self.page = page
        self.key, self.ph, self.data = key, ph, data
        self.on_change = on_change
        self._ph = False
        if multiline:
            self.e = tk.Text(page.body, bd=0, highlightthickness=0, bg=C_GRAY_BG,
                             font=F(12), fg=C_TXT, wrap="char", padx=10, pady=7)
            page.body.create_window(x, y, window=self.e, width=w, height=h, anchor="nw")
        else:
            self.e = tk.Entry(page.body, bd=0, highlightthickness=0, bg=C_GRAY_BG,
                              font=F(12), fg=C_TXT)
            page.body.create_window(x + 14, y + h / 2, window=self.e,
                                    width=w - 28, height=24, anchor="w")
        if data.get(key):
            self._put(data[key])
        else:
            self._put(ph)
            self.e.config(fg="#A6ACB4")
            self._ph = True
        self.e.bind("<FocusIn>", self._fin)
        self.e.bind("<FocusOut>", self._fout)
        self.e.bind("<KeyRelease>", self._kr)
        self.e.bind("<MouseWheel>", self.page._wheel)
        page._widgets.append(self.e)

    def _val(self):
        return self.e.get("1.0", "end-1c") if isinstance(self.e, tk.Text) else self.e.get()

    def _clear(self):
        if isinstance(self.e, tk.Text):
            self.e.delete("1.0", "end")
        else:
            self.e.delete(0, "end")

    def _put(self, s):
        if isinstance(self.e, tk.Text):
            self.e.insert("1.0", s)
        else:
            self.e.insert(0, s)

    def _fin(self, ev):
        if self._ph:
            self._clear()
            self.e.config(fg=C_TXT)
            self._ph = False

    def _fout(self, ev):
        if not self._val().strip():
            self._clear()
            self._put(self.ph)
            self.e.config(fg="#A6ACB4")
            self._ph = True
            self.data[self.key] = ""

    def _kr(self, ev):
        v = self._val().strip()
        self.data[self.key] = "" if (self._ph or v == self.ph) else v
        if self.on_change:
            self.on_change()


# ============================================================
# 页面基类
# ============================================================
class Page:
    """顶部固定条 + 可滚动内容区 + 可选底部操作条"""
    def __init__(self, app, top_h=30, foot_h=0, has_nav=True):
        self.app = app
        self.top_h = top_h
        self.has_nav = has_nav
        nav_h = 62 if has_nav else 0
        self.body_h = 780 - top_h - foot_h - nav_h
        self.frame = tk.Frame(app.page_box, width=390, height=780,
                              bg=C_BG, highlightthickness=0)
        self.top_cv = tk.Canvas(self.frame, width=390, height=top_h,
                                bg=C_BG, highlightthickness=0)
        self.top_cv.place(x=0, y=0)
        self.body = tk.Canvas(self.frame, width=390, height=self.body_h,
                              bg=C_BG, highlightthickness=0)
        self.body.place(x=0, y=top_h)
        self.foot_cv = None
        if foot_h:
            self.foot_cv = tk.Canvas(self.frame, width=390, height=foot_h,
                                     bg="#FFFFFF", highlightthickness=0)
            self.foot_cv.place(x=0, y=780 - nav_h - foot_h)
            self.foot_cv.create_line(0, 0, 390, 0, fill=C_LINE)
        self.offset = 0
        self.content_h = self.body_h
        self.views = []
        self.tviews = []
        self.fviews = []
        self._widgets = []
        for c in (self.body, self.top_cv, self.foot_cv):
            if c is not None:
                c.bind("<MouseWheel>", self._wheel)
        self.body.bind("<Button-1>", self._click)
        self.top_cv.bind("<Button-1>", self._tclick)
        if self.foot_cv:
            self.foot_cv.bind("<Button-1>", self._fclick)
        self.build_top()
        if self.foot_cv:
            self.build_foot()
        self.refresh()

    # ---------- 子类实现 ----------
    def build_top(self):
        self.draw_status()

    def build_foot(self):
        pass

    def build_body(self):
        pass

    # ---------- 公共绘制 ----------
    def draw_status(self):
        """仿手机状态栏(真实时间 + 信号/电量图标)"""
        cv = self.top_cv
        cv.create_rectangle(0, 0, 390, 30, fill=C_BG, outline="")
        cv.create_text(24, 15, text=time.strftime("%H:%M"), font=F(11, True),
                       fill=C_TXT, anchor="w")
        x = 332
        for i, hh in enumerate([4, 6, 8, 10]):
            cv.create_rectangle(x, 20 - hh, x + 2.5, 20, fill="#3A3F47", outline="")
            x += 5
        x += 3
        cv.create_rectangle(x, 11, x + 17, 22, outline="#3A3F47", width=1.1)
        cv.create_rectangle(x + 18, 14.5, x + 20, 18.5, fill="#3A3F47", outline="")
        cv.create_rectangle(x + 1.8, 13, x + 12, 20, fill="#3A3F47", outline="")

    def draw_topbar(self, title):
        """子页面标题栏(返回箭头 + 标题)"""
        cv = self.top_cv
        cv.create_line(22, 42, 14, 52, 22, 62, width=2.2, fill=C_TXT,
                       capstyle="round", joinstyle="round")
        cv.create_text(195, 52, text=title, font=F(14, True), fill=C_TXT)
        Vt(self, 6, 34, 44, 72, self.app.pop)

    def refresh(self):
        self.body.delete("all")
        self.views.clear()
        self._widgets.clear()
        self.build_body()
        self.content_h = max(self.body_h, self.content_h)
        self.offset = max(0, min(self.offset, self.content_h - self.body_h))
        self.body.move("all", 0, -self.offset)

    # ---------- 事件 ----------
    def _wheel(self, e):
        if self.content_h <= self.body_h:
            return
        d = -int(e.delta / 120) * 42
        new = max(0, min(self.content_h - self.body_h, self.offset + d))
        if new != self.offset:
            self.body.move("all", 0, self.offset - new)
            self.offset = new

    def _click(self, e):
        y = e.y + self.offset
        for x1, y1, x2, y2, cb in reversed(self.views):
            if x1 <= e.x <= x2 and y1 <= y <= y2:
                cb()
                return

    def _tclick(self, e):
        y = e.y
        for x1, y1, x2, y2, cb in reversed(self.tviews):
            if x1 <= e.x <= x2 and y1 <= y <= y2:
                cb()
                return

    def _fclick(self, e):
        y = e.y
        for x1, y1, x2, y2, cb in reversed(self.fviews):
            if x1 <= e.x <= x2 and y1 <= y <= y2:
                cb()
                return


def item_card(page, y, it, cb):
    """物品信息卡片(首页/信息/搜索/我的 共用)"""
    cv = page.body
    x, w, h = PAD, CW, 84
    rrect(cv, x, y, x + w, y + h, 14, fill=C_CARD, outline=C_LINE)
    tint = C_GREEN_BG if it["kind"] == "招领" else C_ORANGE_BG
    rrect(cv, x + 12, y + 18, x + 60, y + 66, 12, fill=tint, outline="")
    cv.create_text(x + 36, y + 42, text=it["emoji"], font=F(20))
    cv.create_text(x + 70, y + 16, text=clip(cv, it["title"], F(13, True), 212),
                   font=F(13, True), fill=C_TXT, anchor="w")
    if it["kind"] == "招领":
        kbg, kfg = C_GREEN_BG, C_GREEN_D
    else:
        kbg, kfg = C_ORANGE_BG, C_ORANGE_D
    rrect(cv, x + 70, y + 38, x + 106, y + 56, 9, fill=kbg, outline="")
    cv.create_text(x + 88, y + 47, text=it["kind"], font=F(9.5), fill=kfg)
    if it["status"] == "进行中":
        sbg, sfg = C_GREEN_BG, C_GREEN_D
    else:
        sbg, sfg = C_GRAY_BG, C_SUB
    rrect(cv, x + 112, y + 38, x + 148, y + 56, 9, fill=sbg, outline="")
    cv.create_text(x + 130, y + 47, text=it["status"], font=F(9.5), fill=sfg)
    cv.create_text(x + 70, y + 69, text=f"📍 {it['location']} · {it['time']}",
                   font=F(9.5), fill=C_SUB, anchor="w")
    cv.create_text(x + w - 16, y + 42, text="›", font=F(16), fill="#C2C7CE")
    V(page, x, y, x + w, y + h, cb)
    return y + h + 10


def empty_state(page, y, emoji, text, sub):
    cv = page.body
    y += 60
    cv.create_text(195, y, text=emoji, font=F(30))
    y += 46
    cv.create_text(195, y, text=text, font=F(12), fill=C_SUB)
    y += 24
    cv.create_text(195, y, text=sub, font=F(10.5), fill="#B4B9C0")
    return y + 30


# ============================================================
# 首页
# ============================================================
class HomePage(Page):
    def __init__(self, app):
        self.tab = 0      # 全部 / 招领 / 寻物
        self.cat = None   # 快速入口分类关键词
        super().__init__(app)

    def filtered(self):
        items = list(ITEMS)
        if self.tab:
            items = [it for it in items if it["kind"] == ["全部", "招领", "寻物"][self.tab]]
        if self.cat:
            items = [it for it in items
                     if self.cat in it["title"] or self.cat in it["category"]
                     or self.cat in it["location"]]
        return items

    def set_cat(self, kw):
        self.cat = kw
        self.tab = 0
        self.refresh()

    def on_tab(self, i):
        self.tab = i
        self.refresh()

    def build_body(self):
        cv = self.body
        app = self.app
        X, W = PAD, CW
        y = 12
        cv.create_text(X + 2, y + 2, text="福州大学 · 旗山校区 · 晴 23°",
                       font=F(10.5), fill=C_SUB, anchor="w")
        y += 24
        cv.create_text(X + 2, y, text="校园失物招领", font=F(21, True), fill=C_TXT, anchor="w")
        y += 30
        cv.create_text(X + 2, y, text="让每一次遗失，都有回家的线索",
                       font=F(10.5), fill=C_SUB, anchor="w")
        y += 26
        cv.create_text(X + 2, y, text="今天，帮一件物品回家",
                       font=F(16, True), fill=C_GREEN_D, anchor="w")
        y += 24
        # 搜索条
        rrect(cv, X, y, X + W, y + 40, 20, fill=C_GRAY_BG, outline="")
        cv.create_text(X + 16, y + 20, text="🔍", font=F(12))
        cv.create_text(X + 34, y + 20, text="搜索物品名称、地点或关键词",
                       font=F(11), fill="#9AA0A6", anchor="w")
        V(self, X, y, X + W, y + 40, lambda: app.push(SearchPage(app)))
        y += 52
        # 校园地图卡片
        rrect(cv, X, y, X + W, y + 110, 16, fill="#E7F1E7", outline="")
        cv.create_text(X + 18, y + 26, text="打开校园地图", font=F(15, True),
                       fill="#2F5D44", anchor="w")
        cv.create_text(X + 18, y + 52, text="旗山校区导览图", font=F(10),
                       fill="#7FA08B", anchor="w")
        cv.create_text(X + 18, y + 78, text="高频遗失地点一图掌握 ›", font=F(10),
                       fill=C_GREEN, anchor="w")
        if app.img_map_small:
            cv.create_image(X + W - 16, y + 55, image=app.img_map_small, anchor="e")
        V(self, X, y, X + W, y + 110, lambda: app.push(MapPage(app)))
        y += 122
        # 快速入口
        cv.create_text(X + 2, y, text="快速入口", font=F(14, True), fill=C_TXT, anchor="w")
        y += 24
        x0 = X
        for text, emo, kw in [("全部", None, None), ("校园卡", "🪪", "校园卡"),
                              ("雨伞", "☂", "雨伞"), ("耳机", "🎧", "耳机"),
                              ("书籍", "📚", "书籍")]:
            tw = tkfont.Font(font=F(11)).measure(text)
            w = tw + (18 if emo else 0) + 24
            ChipBtn(self, x0, y, w, 32, text, lambda kw=kw: self.set_cat(kw),
                    selected=(self.cat == kw), emoji=emo)
            x0 += w + 8
        y += 44
        # 最新信息 + 分段筛选
        cv.create_text(X + 2, y, text="最新信息", font=F(14, True), fill=C_TXT, anchor="w")
        SegTabs(self, 168, y - 15, 206, 30, ["全部", "招领", "寻物"], self.tab, self.on_tab)
        y += 28
        items = self.filtered()
        if not items:
            self.content_h = empty_state(self, y, "😔", "暂无相关物品信息", "换个分类看看吧") + 12
        else:
            for it in items:
                y = item_card(self, y, it, lambda it=it: app.push(DetailPage(app, it)))
            self.content_h = y + 12


# ============================================================
# 信息列表
# ============================================================
class InfoPage(Page):
    def __init__(self, app):
        self.state = {"tab": 0, "cat": None, "loc": None}
        super().__init__(app)

    def apply_filters(self, loc=None):
        self.state["loc"] = loc

    def filtered(self):
        items = list(ITEMS)
        if self.state["tab"]:
            items = [it for it in items
                     if it["kind"] == ["全部", "招领", "寻物"][self.state["tab"]]]
        if self.state["cat"]:
            items = [it for it in items if it["category"] == self.state["cat"]]
        if self.state["loc"]:
            items = [it for it in items if self.state["loc"] in it["location"]]
        return items

    def on_tab(self, i):
        self.state["tab"] = i
        self.refresh()

    def on_cat(self, c):
        self.state["cat"] = None if self.state["cat"] == c else c
        self.refresh()

    def clear_loc(self):
        self.state["loc"] = None
        self.refresh()

    def build_body(self):
        cv = self.body
        app = self.app
        X, W = PAD, CW
        y = 12
        cv.create_text(X + 2, y + 2, text="最新信息", font=F(20, True), fill=C_TXT, anchor="w")
        y += 30
        rrect(cv, X, y, X + W, y + 40, 20, fill=C_GRAY_BG, outline="")
        cv.create_text(X + 16, y + 20, text="🔍", font=F(12))
        cv.create_text(X + 34, y + 20, text="搜索物品名称、分类、地点",
                       font=F(11), fill="#9AA0A6", anchor="w")
        V(self, X, y, X + W, y + 40, lambda: app.push(SearchPage(app)))
        y += 52
        SegTabs(self, X, y, W, 34, ["全部", "招领", "寻物"], self.state["tab"], self.on_tab)
        y += 46
        # 分类筛选
        cw, ch, gap = 81, 32, 9
        for i, c in enumerate(CATEGORIES):
            col, row = i % 4, i // 4
            ChipBtn(self, X + col * (cw + gap), y + row * (ch + 8), cw, ch, c,
                    lambda c=c: self.on_cat(c), selected=(self.state["cat"] == c))
        y += 2 * ch + 8 + 12
        # 地点筛选(来自地图页)
        if self.state["loc"]:
            loc = self.state["loc"]
            tw = tkfont.Font(font=F(11)).measure(loc) + 56
            ChipBtn(self, X, y, tw, 30, f"📍 {loc}  ×", lambda: self.clear_loc(), selected=True)
            y += 40
        items = self.filtered()
        cv.create_text(X + 2, y + 2, text=f"共 {len(items)} 条信息",
                       font=F(10), fill=C_SUB, anchor="w")
        y += 18
        if not items:
            self.content_h = empty_state(self, y, "😔", "暂无相关物品信息", "换个筛选条件试试吧") + 12
        else:
            for it in items:
                y = item_card(self, y, it, lambda it=it: app.push(DetailPage(app, it)))
            self.content_h = y + 12


# ============================================================
# 搜索页
# ============================================================
class SearchPage(Page):
    def __init__(self, app):
        self.mode = "home"     # home=历史+热门  results=搜索结果
        self.kw = ""
        self.results = []
        super().__init__(app, top_h=74, has_nav=False)

    def build_top(self):
        self.draw_status()
        cv = self.top_cv
        rrect(cv, 16, 36, 316, 70, 17, fill=C_GRAY_BG, outline="")
        cv.create_text(34, 53, text="🔍", font=F(12))
        self.entry = tk.Entry(cv, bd=0, highlightthickness=0, bg=C_GRAY_BG,
                              font=F(12), fg=C_TXT)
        self.entry.place(x=48, y=41, width=250, height=24)
        self.entry.bind("<Return>", lambda e: self.do_search())
        self._widgets.append(self.entry)
        cv.create_text(340, 53, text="取消", font=F(12, True), fill=C_GREEN_D)
        Vt(self, 316, 36, 390, 70, self.app.pop)

    def do_search(self, kw=None):
        kw = kw or self.entry.get().strip()
        if not kw:
            self.app.toast("请输入搜索关键词")
            return
        self.app.add_history(kw)
        self.kw = kw
        self.results = [it for it in ITEMS
                        if kw.lower() in (it["title"] + it["category"] + it["location"]).lower()]
        self.mode = "results"
        self.entry.delete(0, "end")
        self.entry.insert(0, kw)
        self.refresh()

    def _history_chips(self, y):
        cv = self.body
        app = self.app
        X, W = PAD, CW
        cv.create_text(X + 2, y, text="搜索历史", font=F(14, True), fill=C_TXT, anchor="w")
        cv.create_text(X + W - 2, y, text="清空", font=F(10.5), fill=C_SUB, anchor="e")
        V(self, X + W - 50, y - 14, X + W, y + 14, self._clear_history)
        y += 22
        if not app.search_history:
            cv.create_text(X + 2, y + 8, text="暂无搜索历史", font=F(10.5),
                           fill="#B4B9C0", anchor="w")
            y += 34
        else:
            x0 = X
            for kw in app.search_history:
                w = tkfont.Font(font=F(11)).measure(kw) + 28
                if x0 + w > X + W:
                    y += 40
                    x0 = X
                ChipBtn(self, x0, y, w, 32, kw, lambda kw=kw: self.do_search(kw),
                        bg="#FFFFFF", fg=C_TXT, bg_sel=C_GREEN_BG, fg_sel=C_GREEN_D,
                        outline_sel=C_GREEN)
                x0 += w + 8
            y += 44
        return y

    def _clear_history(self):
        self.app.search_history.clear()
        self.app.toast("已清空搜索历史")
        self.refresh()

    def build_body(self):
        cv = self.body
        X, W = PAD, CW
        y = 12
        if self.mode == "results":
            n = len(self.results)
            cv.create_text(X + 2, y + 2, text=f"共 {n} 条与「{self.kw}」相关的结果",
                           font=F(11), fill=C_SUB, anchor="w")
            y += 24
            if not n:
                self.content_h = empty_state(self, y, "🔍", "没有找到相关物品",
                                             "换个关键词试试吧") + 12
            else:
                for it in self.results:
                    y = item_card(self, y, it,
                                  lambda it=it: self.app.push(DetailPage(self.app, it)))
                self.content_h = y + 12
        else:
            y = self._history_chips(y)
            cv.create_text(X + 2, y + 2, text="热门搜索", font=F(14, True),
                           fill=C_TXT, anchor="w")
            y += 24
            for i, (kw, n) in enumerate(HOT_SEARCHES):
                rank_c = C_ORANGE if i < 3 else "#B4B9C0"
                cv.create_text(X + 8, y + 17, text=str(i + 1), font=F(13, True), fill=rank_c)
                cv.create_text(X + 32, y + 17, text=kw, font=F(12.5), fill=C_TXT, anchor="w")
                cv.create_text(X + W - 4, y + 17, text=f"{n}人搜过",
                               font=F(10), fill=C_SUB, anchor="e")
                V(self, X, y, X + W, y + 34, lambda kw=kw: self.do_search(kw))
                y += 34
            self.content_h = y + 12


# ============================================================
# 信息详情页
# ============================================================
class DetailPage(Page):
    def __init__(self, app, item):
        self.item = item
        super().__init__(app, top_h=74, foot_h=64, has_nav=False)

    def build_top(self):
        self.draw_status()
        self.draw_topbar("信息详情")

    def build_body(self):
        cv = self.body
        it = self.item
        X, W = PAD, CW
        loc_l = "丢失地点" if it["kind"] == "寻物" else "拾得地点"
        t_l = "丢失时间" if it["kind"] == "寻物" else "拾得时间"
        y = 14
        # 物品图案
        tint = C_GREEN_BG if it["kind"] == "招领" else C_ORANGE_BG
        rrect(cv, 153, y, 237, y + 84, 18, fill=tint, outline="")
        cv.create_text(195, y + 42, text=it["emoji"], font=F(34))
        y += 92
        # 类型 + 状态
        kind_t = "寻物启事" if it["kind"] == "寻物" else "失物招领"
        kw = tkfont.Font(font=F(10.5, True)).measure(kind_t) + 28
        sw = tkfont.Font(font=F(10)).measure(it["status"]) + 22
        total = kw + 8 + sw
        x0 = 195 - total / 2
        kbg = C_ORANGE_BG if it["kind"] == "寻物" else C_GREEN_BG
        kfg = C_ORANGE_D if it["kind"] == "寻物" else C_GREEN_D
        rrect(cv, x0, y, x0 + kw, y + 26, 13, fill=kbg, outline="")
        cv.create_text(x0 + kw / 2, y + 13, text=kind_t, font=F(10.5, True), fill=kfg)
        sbg = C_GREEN_BG if it["status"] == "进行中" else C_GRAY_BG
        sfg = C_GREEN_D if it["status"] == "进行中" else C_SUB
        rrect(cv, x0 + kw + 8, y, x0 + kw + 8 + sw, y + 26, 13, fill=sbg, outline="")
        cv.create_text(x0 + kw + 8 + sw / 2, y + 13, text=it["status"], font=F(10), fill=sfg)
        y += 34
        # 标题与概要
        cv.create_text(195, y, text=it["title"], font=F(17, True), fill=C_TXT,
                       width=330, justify="center")
        y += 28
        cv.create_text(195, y, text=f"{it['category']} · {loc_l}：{it['location']}",
                       font=F(10.5), fill=C_SUB, width=330, justify="center")
        y += 32
        # 基本信息
        rows = [("信息类型", KIND_FULL[it["kind"]]), ("物品分类", it["category"]),
                (loc_l, it["location"]), (t_l, it["lost"]), ("发布时间", it["published"])]
        card_h = 14 + 24 + len(rows) * 26 + 10
        rrect(cv, X, y, X + W, y + card_h, 14, fill=C_CARD, outline=C_LINE)
        cv.create_text(X + 18, y + 16, text="基本信息", font=F(13, True), fill=C_TXT, anchor="w")
        ry = y + 42
        for lbl, val in rows:
            cv.create_text(X + 18, ry, text=lbl, font=F(11), fill=C_SUB, anchor="w")
            cv.create_text(X + W - 18, ry, text=clip(cv, val, F(11), 220),
                           font=F(11), fill=C_TXT, anchor="e")
            ry += 26
        y += card_h + 12
        # 详细描述
        rid = rrect(cv, X, y, X + W, y + 10, 14, fill=C_CARD, outline=C_LINE)
        cv.create_text(X + 18, y + 16, text="详细描述", font=F(13, True),
                       fill=C_TXT, anchor="w")
        tid = cv.create_text(X + 18, y + 38, text=it["desc"] or "（暂无详细描述）",
                             width=W - 36, font=F(11), fill="#3D4148",
                             anchor="nw", justify="left")
        _, _, _, y2 = cv.bbox(tid)
        y += (y2 - y) + 16
        cv.delete(rid)
        rid = rrect(cv, X, y - (y2 - y) - 16, X + W, y, 14, fill=C_CARD, outline=C_LINE)
        cv.tag_lower(rid)
        y += 12
        # 发布者
        name = it["publisher"] if it["publisher"] != "我" else "校园同学"
        rrect(cv, X, y, X + W, y + 72, 14, fill=C_CARD, outline=C_LINE)
        cv.create_text(X + 18, y + 16, text="发布者", font=F(13, True), fill=C_TXT, anchor="w")
        cv.create_oval(X + 24, y + 32, X + 60, y + 68, fill=C_GREEN, outline="")
        cv.create_text(X + 42, y + 50, text=name[0], font=F(15, True), fill="#FFFFFF")
        cv.create_text(X + 72, y + 40, text=name, font=F(12.5, True), fill=C_TXT, anchor="w")
        cv.create_text(X + 72, y + 58, text=it["dept"], font=F(10), fill=C_SUB, anchor="w")
        bw = tkfont.Font(font=F(8.5)).measure("已认证学生") + 14
        rrect(cv, X + W - 18 - bw, y + 36, X + W - 18, y + 56, 10, fill=C_GREEN, outline="")
        cv.create_text(X + W - 18 - bw / 2, y + 46, text="已认证学生", font=F(8.5), fill="#FFFFFF")
        y += 84
        self.content_h = y + 12

    def build_foot(self):
        cv = self.foot_cv
        w, h, gap = 169, 42, 12
        x0 = (390 - 2 * w - gap) // 2
        y = 11
        rrect(cv, x0, y, x0 + w, y + h, 21, fill="#FFFFFF", outline=C_GREEN, width=1.6)
        cv.create_text(x0 + w / 2, y + h / 2, text="电话联系", font=F(13, True), fill=C_GREEN_D)
        Vf(self, x0, y, x0 + w, y + h,
           lambda: self.app.toast(f"已为你展示联系方式：{self.item['contact']}（原型模拟）"))
        x1 = x0 + w + gap
        rrect(cv, x1, y, x1 + w, y + h, 21, fill=C_GREEN, outline="")
        cv.create_text(x1 + w / 2, y + h / 2, text="站内联系", font=F(13, True), fill="#FFFFFF")
        Vf(self, x1, y, x1 + w, y + h,
           lambda: self.app.toast("已发起站内联系，对方将在消息中心回复你（原型模拟）"))


# ============================================================
# 发布页
# ============================================================
class PublishPage(Page):
    def __init__(self, app):
        self.data = {"kind": "寻物", "name": "", "cat": None, "loc": "",
                     "t": "", "desc": "", "contact": "", "img": False,
                     "_loc_custom": ""}
        self.panel = None    # None / "loc" / "t"
        super().__init__(app)

    # ---------- 工具 ----------
    def labels(self):
        if self.data["kind"] == "寻物":
            return "丢失地点", "丢失时间", "如：校园卡、黑色雨伞、AirPods耳机"
        return "拾得地点", "拾得时间", "如：校园卡、黑色雨伞、AirPods耳机"

    def label_row(self, y, text):
        cv = self.body
        cv.create_text(PAD + 2, y, text=text, font=F(12, True), fill=C_TXT, anchor="w")
        w = tkfont.Font(font=F(12, True)).measure(text)
        cv.create_text(PAD + 2 + w + 3, y, text="*", font=F(12, True), fill=C_GREEN)
        return y + 22

    def input_row(self, y, key, ph, h=40, on_change=None):
        rrect(self.body, PAD, y, PAD + CW, y + h, 10, fill=C_GRAY_BG, outline="")
        Field(self, PAD, y, CW, h, key, ph, self.data, on_change=on_change)
        return y + h + 14

    def picker_row(self, y, key, ph, toggle):
        cv = self.body
        rrect(cv, PAD, y, PAD + CW, y + 40, 10, fill=C_GRAY_BG, outline="")
        val = self.data[key]
        cv.create_text(PAD + 14, y + 20, text=val if val else ph,
                       font=F(12), fill=C_TXT if val else "#A6ACB4", anchor="w")
        cv.create_text(PAD + CW - 16, y + 20, text="›", font=F(14), fill="#B4B9C0")
        V(self, PAD, y, PAD + CW, y + 40, toggle)
        return y + 48

    def chips_panel(self, y, options, cur, pick):
        x0 = PAD
        for opt in options:
            w = tkfont.Font(font=F(11)).measure(opt) + 26
            if x0 + w > PAD + CW:
                y += 40
                x0 = PAD
            ChipBtn(self, x0, y, w, 32, opt, lambda o=opt: pick(o), selected=(cur == opt))
            x0 += w + 8
        return y + 40

    # ---------- 交互 ----------
    def set_kind(self, k):
        self.data["kind"] = k
        self.panel = None
        self.refresh()

    def pick_loc(self, l):
        self.data["loc"] = l
        self.data["_loc_custom"] = ""
        self.panel = None
        self.refresh()

    def pick_t(self, t):
        self.data["t"] = t
        self.panel = None
        self.refresh()

    def _custom_loc(self):
        self.data["loc"] = self.data.get("_loc_custom", "")

    def toggle_img(self):
        self.data["img"] = not self.data["img"]
        self.app.toast("已添加 1 张示例图片（原型模拟）" if self.data["img"]
                       else "已移除图片")
        self.refresh()

    def do_publish(self):
        d = self.data
        loc_l, t_l, _ = self.labels()
        for k, label in [("name", "物品名称"), ("cat", "物品分类"),
                         ("loc", loc_l), ("t", t_l), ("contact", "联系方式")]:
            if not d.get(k):
                self.app.toast(f"请先填写：{label}")
                return
        it = {"title": d["name"], "emoji": CAT_EMOJI.get(d["cat"], "📦"),
              "kind": d["kind"], "category": d["cat"],
              "location": d["loc"], "time": "刚刚", "status": "进行中",
              "lost": d["t"], "published": "刚刚",
              "desc": d["desc"] or "（暂无详细描述）",
              "publisher": "我", "dept": "经济与管理学院",
              "contact": d["contact"], "mine": True}
        ITEMS.insert(0, it)
        self.app.toast("发布成功，快去首页看看吧")
        self.data = {"kind": d["kind"], "name": "", "cat": None, "loc": "",
                     "t": "", "desc": "", "contact": "", "img": False,
                     "_loc_custom": ""}
        self.panel = None
        self.app.show_tab("home")

    # ---------- 绘制 ----------
    def build_body(self):
        cv = self.body
        X, W = PAD, CW
        y = 10
        cv.create_text(X + 2, y + 4, text="发布信息", font=F(20, True), fill=C_TXT, anchor="w")
        y += 40
        # 类型选择
        for i, (k, t, s1, s2) in enumerate([("寻物", "寻物启事", "我的物品丢了", "请大家帮忙留意"),
                                            ("招领", "失物招领", "我捡到了物品", "寻找失主归还")]):
            x = X + i * (171 + 16)
            sel = self.data["kind"] == k
            rrect(cv, x, y, x + 171, y + 78, 14,
                  fill=C_GREEN_BG if sel else "#FFFFFF",
                  outline=C_GREEN if sel else C_LINE, width=2 if sel else 1)
            cv.create_text(x + 16, y + 18, text=t, font=F(13, True),
                           fill=C_GREEN_D if sel else C_TXT, anchor="w")
            cv.create_text(x + 16, y + 42, text=s1, font=F(9.5), fill=C_SUB, anchor="w")
            cv.create_text(x + 16, y + 60, text=s2, font=F(9.5), fill=C_SUB, anchor="w")
            if sel:
                cv.create_text(x + 154, y + 20, text="✓", font=F(12, True), fill=C_GREEN)
            V(self, x, y, x + 171, y + 78, lambda k=k: self.set_kind(k))
        y += 90
        # 表单
        y = self.label_row(y, "物品名称")
        y = self.input_row(y, "name", self.labels()[2])
        y = self.label_row(y, "物品分类")
        cw, ch, gap = 81, 34, 9
        for i, c in enumerate(CATEGORIES):
            col, row = i % 4, i // 4
            ChipBtn(self, X + col * (cw + gap), y + row * (ch + 8), cw, ch, c,
                    lambda c=c: self.on_cat(c), selected=(self.data["cat"] == c))
        y += 2 * ch + 8 + 14
        loc_l, t_l, _ = self.labels()
        y = self.label_row(y, loc_l)
        y = self.picker_row(y, "loc", "请选择或填写地点",
                            lambda: self._toggle("loc"))
        if self.panel == "loc":
            y = self.chips_panel(y, LOCATIONS, self.data["loc"], self.pick_loc)
            rrect(self.body, X, y, X + W, y + 40, 10, fill=C_GRAY_BG, outline="")
            Field(self, X, y, W, 40, "_loc_custom", "或填写其他地点", self.data,
                  on_change=self._custom_loc)
            y += 48
        y = self.label_row(y, t_l)
        y = self.picker_row(y, "t", "请选择时间", lambda: self._toggle("t"))
        if self.panel == "t":
            y = self.chips_panel(y, TIME_OPTIONS, self.data["t"], self.pick_t)
        y = self.label_row(y, "详细描述")
        rrect(self.body, X, y, X + W, y + 76, 10, fill=C_GRAY_BG, outline="")
        Field(self, X, y, W, 76, "desc",
              "补充物品颜色、特征、品牌等信息，便于辨认（选填）", self.data, multiline=True)
        y += 88
        y = self.label_row(y, "联系方式")
        y = self.input_row(y, "contact", "微信号 / 手机号，方便对方联系你")
        y = self.label_row(y, "物品图片")
        if not self.data["img"]:
            cv.create_rectangle(X, y, X + W, y + 84, outline="#B9BFC7", dash=(5, 4))
            cv.create_text(195, y + 34, text="＋", font=F(20), fill="#B4B9C0")
            cv.create_text(195, y + 62, text="添加图片", font=F(11), fill=C_SUB)
            V(self, X, y, X + W, y + 84, self.toggle_img)
            y += 96
        else:
            rrect(cv, X, y, X + W, y + 84, 10, fill=C_GREEN_BG, outline=C_GREEN, width=1.4)
            cv.create_text(60, y + 42, text="📷", font=F(24))
            cv.create_text(X + 90, y + 30, text="已添加 1 张示例图片", font=F(12),
                           fill=C_GREEN_D, anchor="w")
            cv.create_text(X + 90, y + 56, text="点击移除", font=F(10), fill=C_SUB, anchor="w")
            V(self, X, y, X + W, y + 84, self.toggle_img)
            y += 96
        y += 8
        Btn(self, X, y, W, 46, "立即发布", self.do_publish, radius=23)
        y += 62
        self.content_h = y + 8

    def on_cat(self, c):
        self.data["cat"] = None if self.data["cat"] == c else c
        self.refresh()

    def _toggle(self, name):
        self.panel = None if self.panel == name else name
        self.refresh()


# ============================================================
# 校园地图页
# ============================================================
class MapPage(Page):
    def __init__(self, app):
        self.zoom = False
        self.map_x = 0
        self._drag = None
        self.img_w = 0
        self.img_h = 0
        self.img_y = 0
        super().__init__(app, top_h=74, has_nav=False)
        self.body.bind("<ButtonPress-1>", self._press)
        self.body.bind("<B1-Motion>", self._motion)
        self.body.bind("<ButtonRelease-1>", self._release)

    def build_top(self):
        self.draw_status()
        self.draw_topbar("校园地图")

    def _cur_img(self):
        full = self.app.img_map_full
        if full is None:
            return None
        if self.zoom:
            return full
        return full.subsample(2, 2)

    def _in_img(self, e):
        return (bool(self.img_h and getattr(self, "_img_id", None))
                and self.img_y <= e.y + self.offset <= self.img_y + self.img_h)

    def _press(self, e):
        self._drag = (e.x, e.y, self.map_x) if self._in_img(e) else None

    def _motion(self, e):
        if self._drag:
            dx = e.x - self._drag[0]
            lo = min(0, 390 - self.img_w)
            self.map_x = max(lo, min(0, self._drag[2] + dx))
            self.body.coords(self._img_id, 195 + self.map_x, self.img_y)

    def _release(self, e):
        if self._drag and abs(e.x - self._drag[0]) < 6 and abs(e.y - self._drag[1]) < 6:
            self.zoom = not self.zoom
            self.map_x = 0
            self.refresh()
        self._drag = None

    def goto(self, loc):
        self.app.show_tab("info", loc=loc)
        self.app.toast(f"已筛选「{loc}」附近的信息")

    def _schematic(self, y, h=380):
        """无地图素材时的简易示意图"""
        cv = self.body
        x, w = PAD, CW
        rrect(cv, x, y, x + w, y + h, 12, fill="#E9F2E6", outline=C_LINE)
        cv.create_line(x + w * 0.5, y, x + w * 0.5, y + h, fill="#FFFFFF", width=10)
        cv.create_line(x, y + h * 0.35, x + w, y + h * 0.35, fill="#FFFFFF", width=8)
        cv.create_line(x, y + h * 0.75, x + w, y + h * 0.75, fill="#FFFFFF", width=8)
        spots = [(0.08, 0.10), (0.60, 0.08), (0.70, 0.44), (0.56, 0.55), (0.12, 0.48),
                 (0.76, 0.80), (0.38, 0.84), (0.08, 0.80), (0.30, 0.26), (0.62, 0.64)]
        for (fx, fy), name in zip(spots, MAP_LOCS):
            rrect(cv, x + fx * w, y + fy * h, x + fx * w + 58, y + fy * h + 26, 6,
                  fill="#DCE8D8", outline="#BFD2B8")
            cv.create_text(x + fx * w + 29, y + fy * h + 13,
                           text=clip(cv, name, F(8.5), 52), font=F(8.5), fill="#5C7A66")
        cv.create_text(x + w - 14, y + h - 12, text="示意地图", font=F(9),
                       fill="#9FB79E", anchor="se")

    def build_body(self):
        cv = self.body
        X, W = PAD, CW
        y = 8
        cv.create_text(195, y, text="福州大学旗山校区 · 点击地图可放大查看",
                       font=F(10), fill=C_SUB)
        y += 20
        self.img_y = y
        img = self._cur_img()
        if img is None:
            self._schematic(y)
            self.img_w, self.img_h = W, 380
            y += 380
        else:
            self._img_cur = img          # 保留引用,防止图片被回收
            self.img_w, self.img_h = img.width(), img.height()
            self._img_id = cv.create_image(195 + self.map_x, y, image=img, anchor="n")
            y += self.img_h
        y += 10
        hint = "拖动地图平移 · 再次点击缩小" if self.zoom else "点击地图放大查看"
        cv.create_text(195, y, text=hint, font=F(9.5), fill="#B4B9C0")
        y += 28
        cv.create_text(X + 2, y + 2, text="高频遗失地点", font=F(14, True),
                       fill=C_TXT, anchor="w")
        y += 26
        cw, ch, gap = 171, 36, 16
        for i, loc in enumerate(MAP_LOCS):
            col, row = i % 2, i // 2
            ChipBtn(self, X + col * (cw + gap), y + row * (ch + 8), cw, ch, loc,
                    lambda l=loc: self.goto(l), bg="#FFFFFF", fg=C_TXT)
        y += ((len(MAP_LOCS) + 1) // 2) * (ch + 8)
        self.content_h = y + 12


# ============================================================
# 消息中心
# ============================================================
class MessagePage(Page):
    def build_body(self):
        cv = self.body
        X, W = PAD, CW
        y = 12
        cv.create_text(X + 2, y + 2, text="消息中心", font=F(20, True), fill=C_TXT, anchor="w")
        y += 34
        for m in MESSAGES:
            rrect(cv, X, y, X + W, y + 86, 14, fill=C_CARD, outline=C_LINE)
            rrect(cv, X + 14, y + 22, X + 56, y + 64, 21, fill=m["tint"], outline="")
            cv.create_text(X + 35, y + 43, text=m["emoji"], font=F(18))
            cv.create_text(X + 70, y + 16, text=clip(cv, m["title"], F(12, True), 230),
                           font=F(12, True), fill=C_TXT, anchor="w")
            cv.create_text(X + 70, y + 46, text=clip(cv, m["body"], F(10.5), 236),
                           font=F(10.5), fill=C_SUB, anchor="w")
            cv.create_text(X + W - 12, y + 16, text=m["time"], font=F(9), fill="#B4B9C0",
                           anchor="e")
            V(self, X, y, X + W, y + 86,
              lambda: self.app.toast("已标记为已读（原型模拟）"))
            y += 96
        self.content_h = y + 8


# ============================================================
# 个人主页
# ============================================================
class ProfilePage(Page):
    def __init__(self, app):
        self.tab = 0     # 全部 / 进行中 / 已完成
        super().__init__(app)

    def on_tab(self, i):
        self.tab = i
        self.refresh()

    def my_items(self):
        mine = [it for it in ITEMS if it["mine"]]
        if self.tab:
            mine = [it for it in mine
                    if it["status"] == ["全部", "进行中", "已完成"][self.tab]]
        return mine

    def build_body(self):
        cv = self.body
        app = self.app
        X, W = PAD, CW
        y = 12
        # 用户卡片
        rrect(cv, X, y, X + W, y + 112, 16, fill=C_GREEN_BG, outline="")
        cv.create_oval(X + 24, y + 24, X + 72, y + 72, fill="#FFFFFF", outline="")
        cv.create_text(X + 48, y + 48, text="赵", font=F(18, True), fill=C_GREEN_D)
        cv.create_text(X + 88, y + 34, text="校园同学", font=F(16, True), fill=C_TXT, anchor="w")
        cv.create_text(X + 88, y + 58, text="经济与管理学院", font=F(10.5),
                       fill=C_SUB, anchor="w")
        bw = tkfont.Font(font=F(8.5)).measure("已认证学生") + 14
        rrect(cv, X + 88, y + 74, X + 88 + bw, y + 94, 10, fill=C_GREEN, outline="")
        cv.create_text(X + 88 + bw / 2, y + 84, text="已认证学生", font=F(8.5), fill="#FFFFFF")
        y += 124
        # 统计
        mine = [it for it in ITEMS if it["mine"]]
        stats = [("我的发布", len(mine)),
                 ("寻物中", sum(1 for it in mine if it["kind"] == "寻物" and it["status"] == "进行中")),
                 ("招领中", sum(1 for it in mine if it["kind"] == "招领" and it["status"] == "进行中")),
                 ("已完成", sum(1 for it in mine if it["status"] == "已完成"))]
        for i, (label, n) in enumerate(stats):
            cx = 48 + i * 98
            cv.create_text(cx, y + 2, text=str(n), font=F(19, True), fill=C_TXT)
            cv.create_text(cx, y + 28, text=label, font=F(10), fill=C_SUB)
        y += 46
        # 我发布的信息
        cv.create_text(X + 2, y + 2, text="我发布的信息", font=F(14, True),
                       fill=C_TXT, anchor="w")
        SegTabs(self, 158, y - 13, 216, 30, ["全部", "进行中", "已完成"], self.tab, self.on_tab)
        y += 26
        items = self.my_items()
        if not items:
            self.content_h = empty_state(self, y, "📭", "还没有发布过信息",
                                         "点击底部「发布」发布第一条吧") + 12
        else:
            for it in items:
                y = item_card(self, y, it, lambda it=it: app.push(DetailPage(app, it)))
            self.content_h = y + 12


# ============================================================
# 应用外壳(手机框 + 底部导航 + 页面管理)
# ============================================================
class App:
    NAVS = [("首页", "home"), ("信息", "info"), ("发布", "publish"),
            ("消息", "msg"), ("我的", "profile")]

    def __init__(self):
        self.root = tk.Tk()
        self.root.title("校园失物招领 · 小程序原型 v1")
        self.root.configure(bg=C_DARK)
        self.root.resizable(False, False)
        sw, sh = self.root.winfo_screenwidth(), self.root.winfo_screenheight()
        self.root.geometry(f"430x840+{(sw - 430) // 2}+{max(0, (sh - 840) // 2)}")
        self.page_box = tk.Frame(self.root, width=390, height=780, bg=C_DARK,
                                 highlightthickness=0)
        self.page_box.place(x=20, y=30)
        self.page_box.pack_propagate(False)
        # 地图素材(缺失时自动降级为示意地图)
        here = os.path.dirname(os.path.abspath(__file__))
        self.img_map_small = self._load_img(os.path.join(here, "map_small.png"))
        self.img_map_full = self._load_img(os.path.join(here, "map_full.png"))
        # 搜索历史(初始值与设计稿一致)
        self.search_history = ["图书馆", "校园卡", "钥匙", "耳机"]
        # 页面
        self.pages = {"home": HomePage(self), "info": InfoPage(self),
                      "publish": PublishPage(self), "msg": MessagePage(self),
                      "profile": ProfilePage(self)}
        # 底部导航
        self.nav_cv = tk.Canvas(self.page_box, width=390, height=62,
                                bg="#FFFFFF", highlightthickness=0)
        self.nav_cv.bind("<Button-1>", self._nav_click)
        self.nav_cv.bind("<MouseWheel>", lambda e: self.cur._wheel(e))
        # 轻提示
        self.toast_cv = tk.Canvas(self.page_box, bg=C_BG, highlightthickness=0)
        self._toast_after = None
        # 页面管理
        self.cur = None
        self.cur_key = "home"
        self.stack = []
        self.show_tab("home")

    def run(self):
        self.root.mainloop()

    # ---------- 页面管理 ----------
    def _load_img(self, path):
        try:
            return tk.PhotoImage(file=path)
        except Exception:
            return None

    def show_tab(self, key, **filters):
        page = self.pages[key]
        if filters:
            page.apply_filters(**filters)
        page.refresh()
        if self.cur is not None and self.cur is not page:
            self.cur.frame.place_forget()
        self.stack.clear()
        self.cur = page
        self.cur_key = key
        page.frame.place(x=0, y=0)
        self.nav_cv.place(x=0, y=718)
        tk.Misc.lift(self.nav_cv)
        self.draw_nav(key)

    def push(self, page):
        self.cur.frame.place_forget()
        self.nav_cv.place_forget()
        self.stack.append(self.cur)
        self.cur = page
        page.frame.place(x=0, y=0)

    def pop(self):
        if not self.stack:
            return
        self.cur.frame.place_forget()
        self.cur.frame.destroy()
        self.cur = self.stack.pop()
        self.cur.frame.place(x=0, y=0)
        if self.cur.has_nav:
            self.nav_cv.place(x=0, y=718)
            tk.Misc.lift(self.nav_cv)

    # ---------- 导航 ----------
    def _nav_click(self, e):
        i = int(e.x // 78)
        if 0 <= i < len(self.NAVS):
            self.show_tab(self.NAVS[i][1])

    def draw_nav(self, active):
        cv = self.nav_cv
        cv.delete("all")
        cv.create_rectangle(0, 0, 390, 62, fill="#FFFFFF", outline="")
        cv.create_line(0, 0, 390, 0, fill=C_LINE)
        for i, (label, key) in enumerate(self.NAVS):
            cx = 39 + i * 78
            color = C_GREEN if key == active else C_INACTIVE
            self.nav_icon(cv, cx, 16, key, color)
            cv.create_text(cx, 46, text=label, font=F(10), fill=color)

    def nav_icon(self, cv, cx, cy, key, color):
        w = 1.8
        if key == "home":
            cv.create_line(cx - 9, 12, cx - 9, 22, width=w, fill=color)
            cv.create_line(cx - 9, 13, cx, 3, cx + 9, 13, cx + 9, 22, width=w, fill=color)
        elif key == "info":
            cv.create_rectangle(cx - 8, 5, cx + 8, 21, outline=color, width=w)
            cv.create_line(cx - 5, 10, cx + 5, 10, fill=color, width=w)
            cv.create_line(cx - 5, 14, cx + 5, 14, fill=color, width=w)
            cv.create_line(cx - 5, 18, cx + 3, 18, fill=color, width=w)
        elif key == "publish":
            cv.create_oval(cx - 10, 2, cx + 10, 22, outline=color, width=w)
            cv.create_line(cx, 8, cx, 16, fill=color, width=w)
            cv.create_line(cx - 4, 12, cx + 4, 12, fill=color, width=w)
        elif key == "msg":
            cv.create_rectangle(cx - 9, 5, cx + 9, 17, outline=color, width=w)
            cv.create_line(cx - 4, 17, cx - 4, 21, cx + 2, 17, fill=color, width=w)
        else:
            cv.create_oval(cx - 4.5, 2, cx + 4.5, 11, outline=color, width=w)
            cv.create_arc(cx - 9, 9, cx + 9, 27, start=0, extent=180,
                          style="arc", outline=color, width=w)

    # ---------- 其他 ----------
    def add_history(self, kw):
        h = [x for x in self.search_history if x != kw]
        h.insert(0, kw)
        self.search_history = h[:8]

    def toast(self, text, ms=1800):
        cv = self.toast_cv
        cv.delete("all")
        w = tkfont.Font(font=F(11.5)).measure(text) + 44
        h = 40
        cv.configure(width=w, height=h)
        cv.place(x=(390 - w) // 2, y=622)
        rrect(cv, 0, 0, w, h, 20, fill="#33363E", outline="")
        cv.create_text(w / 2, h / 2, text=text, font=F(11.5), fill="#FFFFFF")
        tk.Misc.lift(cv)
        if self._toast_after:
            self.root.after_cancel(self._toast_after)
        self._toast_after = self.root.after(ms, lambda: cv.place_forget())


if __name__ == "__main__":
    App().run()
