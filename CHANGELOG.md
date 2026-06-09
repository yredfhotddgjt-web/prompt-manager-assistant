# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Fixed

- Prevented the side panel from failing on first open when the pending draft in local storage is empty or incomplete
- Restored previously saved Prompt data immediately on startup instead of waiting for a new capture event

## 0.1.0 - 2026-06-07

Initial public release.

### Added

- Manifest V3 sidebar extension foundation
- Local Prompt storage, category management, search and copy flow
- Drag and drop image upload for Prompt screenshots
- Prompt detail view and screenshot lightbox
- Right click capture flow for web content
- Chrome and Edge local installation guidance
- Public project landing page and demo screenshots

### Changed

- Unified product name to `提示词管理助手`
- Tightened text capture rules to avoid automatic image attachment for text-only selections
- Compressed sidebar layout to leave more space for Prompt content

### Packaging

- Prepared Edge unpacked package and zip package for local testing and distribution
