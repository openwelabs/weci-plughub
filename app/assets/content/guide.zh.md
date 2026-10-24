## 什么是 WeCi 插件

WeCi 的 Agent 能力完全由插件驱动。一个插件就是一个目录，至少包含：

- `manifest.json` —— 插件清单（必填）
- `plugin.py` —— 入口模块（文件名由 manifest 的 `entry` 指定）

插件基于 WeCi SDK 开发（`sdk.WeCiPlugin` / `sdk.Tool`），详见
[WeCi 仓库](https://github.com/openwelabs/weci)的文档与 `examples/plugins/hello` 示例。

## manifest.json 字段

```json
{
  "id": "hello",
  "name": "Hello Plugin",
  "version": "0.1.0",
  "description": "Example plugin",
  "author": "Your Name",
  "api_version": "0.1",
  "entry": "plugin.py",
  "permissions": [],
  "default_enabled": true
}
```

| 字段 | 要求 |
| --- | --- |
| `id` | 全局唯一；小写字母开头，2–64 字符，仅 `a-z0-9_-` |
| `version` | 语义化版本，如 `0.1.0` |
| `description` | 一句话介绍，展示在卡片上 |
| `api_version` | 当前固定为 `0.1` |
| `entry` | 入口模块相对路径，必须包含在 zip 内 |
| `permissions` | 声明所需能力，如 `network:access`、`workspace:read` |

## 可选文件

- `README.md` —— 详情页渲染的插件说明（≤64KB）
- `icon.png` / `icon.svg` —— 插件图标（≤256KB）

## 打包

把插件目录压缩为 zip（目录名不限，站内以 `manifest.id` 为准）：

```bash
zip -r hello.zip hello/
```

zip 大小不超过 5MB，文件数不超过 200 个。

## 发布

1. 使用 GitHub 账号登录本站
2. 打开「发布插件」，上传 zip，可选填写 License、源码仓库、关键词
3. 服务端校验通过后立即发布；插件 id 先到先得
4. 在「我的插件」中可以上传新版本或下架

## 用户如何安装

```bash
unzip hello.zip
weci plugin install ./hello
```

重启 WeCi 后，插件工具自动出现在 Agent 中。

## 社区规范

- 只发布你自己有权发布的插件
- 权限声明必须真实：用了网络就声明 `network:access`
- 禁止恶意代码、窃取密钥、混淆代码
- 建议附带开源许可证
- 违规插件会被管理员下架
