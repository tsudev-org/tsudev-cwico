//! The JSON the engine hands the front end must match `ui/src/types.ts`.
//!
//! On 09/11/2026 the first scan of a real Windows 11 machine blanked the whole
//! window: 8 of 631 items had no `extra` and 267 had no `executables`, because
//! empty collections were skipped when serialising, while the UI types them as
//! required and calls `.extra.running` / `.executables.join` unconditionally.
//! The fixture backend always filled both, so nothing caught it. The same
//! pattern sat in `RunReport.warnings`, which a clean run leaves empty - the run
//! panel would have blanked after every successful removal.
//!
//! These tests pin the contract on the serialised form, including for an item
//! that has nothing in either collection.

use cwico_core::mock::{MockBackend, RecordingSink};
use cwico_core::{
    Action, Engine, PlanOptions, RemovalPlan, SafetyDatabase, ScanOptions, Selection, SoftwareItem,
    SourceKind,
};
use serde_json::Value;

type KindCheck = fn(&Value) -> bool;

/// Fields `ui/src/types.ts` declares as required arrays/objects on `SoftwareItem`.
const ITEM_REQUIRED: &[(&str, KindCheck)] = &[
    ("executables", Value::is_array),
    ("extra", Value::is_object),
];

/// Fields `ui/src/types.ts` declares as required arrays on `RunReport`.
const REPORT_REQUIRED: &[&str] = &["registryBackups", "items", "warnings"];

fn assert_item_contract(item: &Value) {
    for (field, is_kind) in ITEM_REQUIRED {
        let v = item
            .get(field)
            .unwrap_or_else(|| panic!("item {} has no `{field}`: {item}", item["id"]));
        assert!(
            is_kind(v),
            "item {}: `{field}` has the wrong type: {v}",
            item["id"]
        );
    }
}

#[test]
fn an_item_with_empty_collections_still_serialises_them() {
    let bare = SoftwareItem::new("svc:Bare", "Bare service", SourceKind::WindowsService);
    assert!(bare.executables.is_empty() && bare.extra.is_empty());
    assert_item_contract(&serde_json::to_value(&bare).unwrap());
}

#[test]
fn every_scanned_item_carries_the_collections_the_ui_requires() {
    let (backend, db) = (MockBackend::new(), SafetyDatabase::builtin());
    let report = Engine::new(&backend, &db)
        .scan(&ScanOptions::default(), &RecordingSink::new())
        .unwrap();
    let json = serde_json::to_value(&report).unwrap();
    let items = json["items"].as_array().expect("items is an array");
    assert!(!items.is_empty());
    items.iter().for_each(assert_item_contract);
    assert!(json["warnings"].is_array());
}

#[test]
fn a_clean_run_report_still_carries_its_empty_lists() {
    let (backend, db) = (MockBackend::new(), SafetyDatabase::builtin());
    let engine = Engine::new(&backend, &db);
    let scan = engine
        .scan(&ScanOptions::default(), &RecordingSink::new())
        .unwrap();
    let picks: Vec<Selection> = scan
        .bulk_selectable()
        .iter()
        .take(1)
        .map(|i| Selection::uninstall(&i.id).with_action(Action::Uninstall))
        .collect();
    let plan = RemovalPlan::build(&scan, &picks, PlanOptions::dry_run());
    let run = engine.execute(&plan, &RecordingSink::new()).unwrap();
    assert!(
        run.warnings.is_empty(),
        "the point is an empty list: {:?}",
        run.warnings
    );

    let json = serde_json::to_value(&run).unwrap();
    for field in REPORT_REQUIRED {
        assert!(
            json[field].is_array(),
            "`{field}` missing or not an array: {json}"
        );
    }
}

#[test]
fn old_json_without_the_collections_still_deserialises() {
    // Transaction logs written by 26.8.1901 skipped empty lists; reading one
    // back must not fail.
    let old = r#"{"id":"svc:Old","name":"Old","source":"windows_service","scope":"machine",
        "arch":"x64","state":"running","safety":"unknown","canDisable":true,"canUninstall":false}"#;
    let item: SoftwareItem = serde_json::from_str(old).unwrap();
    assert!(item.executables.is_empty() && item.extra.is_empty());
}
