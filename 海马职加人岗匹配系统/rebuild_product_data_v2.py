#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重新构建产品数据，完全按照2025年11月海马职加事业部产品资料库.xlsx
"""

import pandas as pd
import json
import re
from pathlib import Path

def parse_price(price_str):
    """解析价格字符串，提取数字"""
    if pd.isna(price_str) or not price_str:
        return None
    
    price_str = str(price_str).strip()
    if price_str == '-' or price_str == '无':
        return None
    
    # 移除逗号，然后提取完整的数字（支持多位数字）
    price_str_clean = price_str.replace(',', '')
    # 匹配完整的数字（包括小数点）
    match = re.search(r'(\d+(?:\.\d+)?)', price_str_clean)
    if match:
        return float(match.group(1))
    return None

def get_delivery_department(row, sheet_name=''):
    """获取交付部门（优先级：交付部门 > 交付 > 负责部门）"""
    delivery = str(row.get('交付部门', '')).strip() if not pd.isna(row.get('交付部门')) else ''
    if not delivery:
        delivery = str(row.get('交付', '')).strip() if not pd.isna(row.get('交付')) else ''
    if not delivery:
        delivery = str(row.get('负责部门', '')).strip() if not pd.isna(row.get('负责部门')) else ''
    
    # 交付方为合作的一律改为职加产品部（刘倩）
    if delivery == '合作':
        delivery = '职加产品部（刘倩）'
    
    # 海外产品的交付部门都是刘倩
    if '海外' in sheet_name or '海外' in str(row.get('产品名', '')) or '海外' in str(row.get('标准产品名', '')):
        delivery = '刘倩'
    
    return delivery

def build_product_name(row):
    """构建产品名（优先使用标准产品名，如果没有则用行业-岗位）"""
    product_name = row.get('标准产品名') or row.get('产品名', '')
    if pd.isna(product_name) or not str(product_name).strip():
        # 从行业和岗位构建
        industry = str(row.get('行业', '')).strip() if not pd.isna(row.get('行业')) else ''
        position = str(row.get('岗位', '')).strip() if not pd.isna(row.get('岗位')) else ''
        if industry and position:
            product_name = f"{industry}-{position}"
        elif industry:
            product_name = industry
        elif position:
            product_name = position
        else:
            return None
    return str(product_name).strip()

def load_product_library():
    """加载2025年11月海马职加事业部产品资料库.xlsx"""
    file_path = Path('/Users/changchun/Desktop/2025年11月海马职加事业部产品资料库.xlsx')
    
    if not file_path.exists():
        print(f"⚠️  文件不存在: {file_path}")
        return []
    
    products = []
    xls = pd.ExcelFile(file_path)
    
    # 定义优惠政策（从产品政策图片中提取）
    discount_policies = {
        '9折': {
            '优惠': '9折',
            '赠课': '赠送一节1v1',
            '适用范围': '自营课时卡',
            '说明': '课时卡9折优惠'
        },
        'PTA最大优惠-2000': {
            '优惠': '标准售价最大优惠-2000',
            '赠课': '赠送一节1v1',
            '适用范围': '领航/曹宇/齐童/职创',
            '说明': 'PTA产品最大优惠2000元'
        },
        '减3000优惠': {
            '优惠': '标准售价最大优惠-3000',
            '赠课': '赠送一节1v1',
            '适用范围': '实地实习产品',
            '说明': '实地实习产品减3000元优惠'
        },
        '4w以下98%，4w以上95%': {
            '优惠': '4w以下98折，4w以上95折',
            '赠课': '赠送一节1v1',
            '适用范围': '冲刺/基础/标准/旗舰/至尊/随心配',
            '说明': '千里马计划：4万以下98折，4万以上95折'
        },
        '不参与优惠。一口价': {
            '优惠': '一口价',
            '赠课': '无',
            '适用范围': '特定产品',
            '说明': '不参与优惠，一口价'
        },
        '底价29800，不叠加其他优惠': {
            '优惠': '一口价29800',
            '赠课': '无',
            '适用范围': '特定产品',
            '说明': '底价29800，不叠加其他优惠'
        },
        '最大优惠2000': {
            '优惠': '最大优惠-2000',
            '赠课': '赠送一节1v1',
            '适用范围': '特定产品',
            '说明': '最大优惠2000元'
        },
        '最低98折': {
            '优惠': '98折',
            '赠课': '无',
            '适用范围': '特定产品',
            '说明': '最低98折优惠'
        }
    }
    
    # 创建产品名到优惠信息的映射（用于合并没有优惠政策的sheet）
    # 优先使用"海外实习求职-刘倩"的数据（有优惠政策和优惠后售价）
    policy_map = {}
    
    # 先处理有优惠政策的sheet，建立映射（优先处理海外实习求职-刘倩）
    priority_sheets = ['海外实习求职-刘倩']
    other_sheets = []
    
    for sheet_name in xls.sheet_names:
        try:
            df = pd.read_excel(xls, sheet_name=sheet_name, nrows=1)
            if '适用优惠政策' in df.columns or '优惠后售价' in df.columns:
                if sheet_name not in priority_sheets:
                    other_sheets.append(sheet_name)
        except:
            pass
    
    # 先处理优先级sheet
    for sheet_name in priority_sheets + other_sheets:
        try:
            df = pd.read_excel(xls, sheet_name=sheet_name, nrows=1)
            if '适用优惠政策' in df.columns or '优惠后售价' in df.columns:
                df_full = pd.read_excel(xls, sheet_name=sheet_name)
                for idx, row in df_full.iterrows():
                    product_name = build_product_name(row)
                    if not product_name:
                        continue
                    
                    discount_policy = str(row.get('适用优惠政策', '')).strip() if not pd.isna(row.get('适用优惠政策')) else ''
                    final_price = row.get('优惠后售价')
                    
                    # 存储到映射中（以产品名为key，优先使用优先级sheet的数据）
                    if product_name not in policy_map or sheet_name in priority_sheets:
                        policy_map[product_name] = {
                            'discount_policy': discount_policy if discount_policy else '无',
                            'final_price': final_price
                        }
        except Exception as e:
            pass  # 忽略错误，继续处理
    
    # 处理所有sheet（优先处理有优惠政策的sheet，避免重复）
    processed_products = set()  # 记录已处理的产品名（用于去重）
    
    # 先处理有优惠政策的sheet（优先）
    priority_sheets = ['海外实习求职-刘倩', '国内实习-刘倩', 'PTA-刘倩']
    other_sheets = [s for s in xls.sheet_names if s not in priority_sheets]
    
    for sheet_name in priority_sheets + other_sheets:
        try:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            print(f"✓ 处理Sheet: {sheet_name} ({len(df)}行)")
            
            for idx, row in df.iterrows():
                # 构建产品名
                product_name = build_product_name(row)
                if not product_name:
                    continue
                
                # 对于海外产品，如果已经处理过（来自优先级sheet），跳过
                if sheet_name not in priority_sheets:
                    product_key = f"{product_name}_{sheet_name}"
                    if product_name in processed_products:
                        continue
                    processed_products.add(product_name)
                
                # 获取交付部门
                delivery = get_delivery_department(row, sheet_name)
                
                # 获取形式
                form = str(row.get('形式', '')).strip() if not pd.isna(row.get('形式')) else ''
                
                # 获取行业、岗位、地点
                industry = str(row.get('行业', '')).strip() if not pd.isna(row.get('行业')) else ''
                position = str(row.get('岗位', '')).strip() if not pd.isna(row.get('岗位')) else ''
                base_location = str(row.get('Base地', '')).strip() if not pd.isna(row.get('Base地')) else ''
                location = base_location
                
                # 获取优惠政策（优先从当前行，如果没有则从映射中获取）
                discount_policy = str(row.get('适用优惠政策', '')).strip() if not pd.isna(row.get('适用优惠政策')) else ''
                if not discount_policy or discount_policy == '无':
                    # 尝试从映射中获取
                    if product_name in policy_map:
                        discount_policy = policy_map[product_name]['discount_policy']
                    else:
                        discount_policy = '无'
                
                # 至尊版和首席版不参与活动
                if '至尊' in product_name or '首席' in product_name:
                    discount_policy = '不参与优惠'
                    policy_detail = None
                else:
                    # 获取标准售价用于判断
                    std_price_num = parse_price(row.get('标准售价')) or parse_price(row.get('产品标准售价'))
                    is_internship = '实习' in sheet_name or '实习' in str(product_name)
                    
                    # 根据活动价格表处理一口价和-3000优惠
                    # 仅部分实习产品25800的参与一口价（根据活动价格表，这些产品在"交付方"列）
                    # 判断是否是一口价产品：标准售价25800且是实习类产品
                    if std_price_num == 25800 and is_internship:
                        # 检查是否在活动价格表中的一口价产品列表
                        # 根据表格，一口价产品是"1段25800、2段9折、3段85折"
                        discount_policy = '1段25800、2段9折、3段85折'
                        policy_detail = {
                            '优惠': '一口价25800（单段），2段9折，3段85折',
                            '赠课': '无',
                            '适用范围': '部分实习产品',
                            '说明': '单段一口价25,800，两段打9折，三段85折'
                        }
                    # 判断是否是-3000优惠产品（根据活动价格表，这些产品在"合作方"列，有-3000售价）
                    # 排除美国等不能参与-3000的产品
                    elif std_price_num and std_price_num >= 16800 and std_price_num <= 39800 and is_internship:
                        # 排除美国产品（根据活动价格表，美国产品不参与-3000优惠）
                        product_name_lower = str(product_name).lower()
                        location_lower = str(location).lower() if location else ''
                        if '美国' not in product_name and '美国' not in location_lower and '美国' not in str(row.get('Base地', '')).lower():
                            # 检查是否是-3000优惠产品（根据表格，标准售价减去3000）
                            # 这些产品在活动价格表中都有-3000售价
                            discount_policy = '减3000优惠'
                            policy_detail = discount_policies.get('减3000优惠', None)
                    else:
                        # 获取优惠政策详情
                        policy_detail = discount_policies.get(discount_policy, None)
                
                # 处理价格（根据sheet类型不同处理）
                prices = {}
                final_prices = {}
                
                # 检查是否有多个售价（1个月、2个月、3个月）
                if '1个月售价' in df.columns:
                    # 有多个售价的情况
                    price_1m = parse_price(row.get('1个月售价'))
                    price_2m = parse_price(row.get('2个月售价'))
                    price_3m = parse_price(row.get('3个月售价'))
                    
                    if price_1m:
                        prices['1个月'] = price_1m
                    if price_2m:
                        prices['2个月'] = price_2m
                    if price_3m:
                        prices['3个月'] = price_3m
                    
                    # 获取优惠后售价
                    final_1m = parse_price(row.get('1个月优惠后售价'))
                    final_2m = parse_price(row.get('2个月优惠后售价'))
                    final_3m = parse_price(row.get('3个月优惠后售价'))
                    
                    # 如果没有单独的优惠后售价，检查是否有统一的
                    if not final_1m and '优惠后售价' in df.columns:
                        final_1m = parse_price(row.get('优惠后售价'))
                    
                    if final_1m:
                        final_prices['1个月'] = final_1m
                    if final_2m:
                        final_prices['2个月'] = final_2m
                    if final_3m:
                        final_prices['3个月'] = final_3m
                    
                    # 检查是否有联报优惠
                    has_lianbao = False
                    lianbao_info = {}
                    if '优惠后9折售价' in df.columns:
                        lianbao_9 = parse_price(row.get('优惠后9折售价'))
                        if lianbao_9:
                            has_lianbao = True
                            lianbao_info['2段9折'] = lianbao_9
                    if '优惠后85折售价' in df.columns:
                        lianbao_85 = parse_price(row.get('优惠后85折售价'))
                        if lianbao_85:
                            has_lianbao = True
                            lianbao_info['3段85折'] = lianbao_85
                    
                    # 如果有多个价格，创建多个产品记录
                    if prices:
                        # 获取产品配置（千里马产品）
                        product_config = str(row.get('产品配置', '')).strip() if '产品配置' in df.columns and not pd.isna(row.get('产品配置')) else ''
                        
                        for duration, price in prices.items():
                            # 根据活动价格表计算优惠后价格
                            final_price = final_prices.get(duration, price)
                            
                            # 如果是一口价产品（25800），根据时长计算
                            if discount_policy == '1段25800、2段9折、3段85折':
                                if duration == '1个月':
                                    final_price = 25800
                                elif duration == '2个月':
                                    final_price = price * 0.9  # 9折
                                elif duration == '3个月':
                                    final_price = price * 0.85  # 85折
                            
                            # 如果是-3000优惠产品，计算优惠后价格
                            elif discount_policy == '减3000优惠':
                                final_price = price - 3000
                                if final_price < 0:
                                    final_price = price  # 防止负数
                            
                            product = {
                                '产品名': product_name,
                                '交付部门': delivery,
                                '形式': form,
                                '行业': industry,
                                '岗位': position,
                                '地点': location,
                                'Base地点': base_location,
                                '时长': duration,
                                '标准售价': price,
                                '事业部最大优惠': discount_policy,
                                '最大优惠后价格': final_price,
                                '联报优惠': lianbao_info if has_lianbao else None,
                                '优惠政策详情': policy_detail,
                                '产品配置': product_config,
                                '来源Sheet': sheet_name,
                                '来源文件': '2025年11月海马职加事业部产品资料库',
                                '是否实习类': '实习' in sheet_name or '实习' in str(product_name),
                            }
                            products.append(product)
                    else:
                        # 没有价格，创建一个记录
                        # 获取产品配置（千里马产品）
                        product_config = str(row.get('产品配置', '')).strip() if '产品配置' in df.columns and not pd.isna(row.get('产品配置')) else ''
                        
                        product = {
                            '产品名': product_name,
                            '交付部门': delivery,
                            '形式': form,
                            '行业': industry,
                            '岗位': position,
                            '地点': location,
                            'Base地点': base_location,
                            '标准售价': None,
                            '事业部最大优惠': discount_policy,
                            '最大优惠后价格': None,
                            '联报优惠': None,
                            '优惠政策详情': policy_detail,
                            '产品配置': product_config,
                            '来源Sheet': sheet_name,
                            '来源文件': '2025年11月海马职加事业部产品资料库',
                            '是否实习类': '实习' in sheet_name or '实习' in str(product_name),
                        }
                        products.append(product)
                else:
                    # 单一售价的情况
                    standard_price = row.get('产品标准售价')
                    final_price = row.get('优惠后售价')
                    
                    # 处理标准售价
                    if pd.notna(standard_price):
                        std_price_str = str(standard_price).strip()
                        std_price_num = parse_price(std_price_str)
                    else:
                        std_price_str = ''
                        std_price_num = None
                    
                    # 处理优惠后售价（优先从当前行，如果没有则从映射中获取）
                    if pd.notna(final_price):
                        final_price_str = str(final_price).strip()
                        final_price_num = parse_price(final_price_str)
                    else:
                        # 尝试从映射中获取
                        if product_name in policy_map and pd.notna(policy_map[product_name]['final_price']):
                            final_price = policy_map[product_name]['final_price']
                            final_price_str = str(final_price).strip()
                            final_price_num = parse_price(final_price_str)
                        else:
                            final_price_str = '无'
                            final_price_num = None
                    
                    # 根据活动价格表处理一口价和-3000优惠
                    # 如果是一口价产品（25800）
                    if discount_policy == '1段25800、2段9折、3段85折' and std_price_num == 25800:
                        final_price_num = 25800
                        final_price_str = '25800'
                    # 如果是-3000优惠产品
                    elif discount_policy == '减3000优惠' and std_price_num:
                        final_price_num = std_price_num - 3000
                        if final_price_num < 0:
                            final_price_num = std_price_num
                        final_price_str = str(int(final_price_num))
                    # 如果没有优惠后售价，使用标准售价
                    elif final_price_num is None and std_price_num:
                        final_price_num = std_price_num
                        final_price_str = str(std_price_num)
                    
                    # 获取产品配置（千里马产品）
                    product_config = str(row.get('产品配置', '')).strip() if not pd.isna(row.get('产品配置')) else ''
                    
                    product = {
                        '产品名': product_name,
                        '交付部门': delivery,
                        '形式': form,
                        '行业': industry,
                        '岗位': position,
                        '地点': location,
                        'Base地点': base_location,
                        '标准售价': std_price_str if std_price_str else (std_price_num if std_price_num else ''),
                        '事业部最大优惠': discount_policy,
                        '最大优惠后价格': final_price_str if final_price_str != '无' else (final_price_num if final_price_num else ''),
                        '联报优惠': None,
                        '优惠政策详情': policy_detail,
                        '产品配置': product_config,
                        '来源Sheet': sheet_name,
                        '来源文件': '2025年11月海马职加事业部产品资料库',
                        '是否实习类': '实习' in sheet_name or '实习' in str(product_name),
                    }
                    products.append(product)
                    processed_products.add(product_name)
                    
        except Exception as e:
            print(f"⚠️  处理Sheet {sheet_name} 失败: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n✓ 总共加载了 {len(products)} 个产品")
    return products

def main():
    print("=" * 80)
    print("重新构建产品数据（完全按照Excel表格）")
    print("=" * 80)
    
    # 加载产品数据
    products = load_product_library()
    
    # 保存
    output_file = Path(__file__).parent / 'products_with_policies.json'
    output_data = {
        'products': products,
        'policies': {
            '9折': {
                '优惠': '9折',
                '赠课': '赠送一节1v1',
                '适用范围': '自营课时卡',
                '说明': '课时卡9折优惠'
            },
            'PTA最大优惠-2000': {
                '优惠': '标准售价最大优惠-2000',
                '赠课': '赠送一节1v1',
                '适用范围': '领航/曹宇/齐童/职创',
                '说明': 'PTA产品最大优惠2000元'
            },
            '减3000优惠': {
                '优惠': '标准售价最大优惠-3000',
                '赠课': '赠送一节1v1',
                '适用范围': '实地实习产品',
                '说明': '实地实习产品减3000元优惠'
            },
            '4w以下98%，4w以上95%': {
                '优惠': '4w以下98折，4w以上95折',
                '赠课': '赠送一节1v1',
                '适用范围': '冲刺/基础/标准/旗舰/至尊/随心配',
                '说明': '千里马计划：4万以下98折，4万以上95折'
            }
        },
        'metadata': {
            'source': '2025年11月海马职加事业部产品资料库.xlsx',
            'total_products': len(products),
            'updated_at': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ 数据已保存到: {output_file}")
    print(f"✓ 总共 {len(products)} 个产品")
    
    # 验证
    print("\n" + "=" * 80)
    print("验证关键产品")
    print("=" * 80)
    
    test_products = ['千里马1v1课时卡', '咨询-罗兰贝格', '中科院（官方）实地人事实习', '英国校招全职项目']
    
    for name in test_products:
        found = [p for p in products if name in p.get('产品名', '')]
        if found:
            p = found[0]
            print(f"\n{p['产品名']}")
            print(f"  交付部门: {p.get('交付部门', 'N/A')}")
            print(f"  形式: {p.get('形式', 'N/A')}")
            print(f"  标准售价: {p.get('标准售价', 'N/A')}")
            print(f"  事业部最大优惠: {p.get('事业部最大优惠', 'N/A')}")
            print(f"  最大优惠后价格: {p.get('最大优惠后价格', 'N/A')}")
            if p.get('时长'):
                print(f"  时长: {p.get('时长', 'N/A')}")
            if p.get('联报优惠'):
                print(f"  联报优惠: {p.get('联报优惠', 'N/A')}")

if __name__ == '__main__':
    main()

