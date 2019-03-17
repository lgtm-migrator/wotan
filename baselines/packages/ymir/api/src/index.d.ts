import 'reflect-metadata';
import * as ts from 'typescript';
import { WrappedAst, BooleanCompilerOptions } from 'tsutils';
export declare class ConfigurationError extends Error {
}
export declare abstract class GlobalOptions {
    readonly [key: string]: {} | null | undefined;
}
export declare type LintResult = Iterable<[string, FileSummary]>;
export declare type FileSummary = LintAndFixFileResult;
export interface LintAndFixFileResult {
    content: string;
    findings: ReadonlyArray<Finding>;
    fixes: number;
}
export interface Replacement {
    readonly start: number;
    readonly end: number;
    readonly text: string;
}
export declare const Replacement: {
    replace(start: number, end: number, text: string): Replacement;
    append(pos: number, text: string): Replacement;
    delete(start: number, end: number): Replacement;
};
export interface Fix {
    readonly replacements: ReadonlyArray<Replacement>;
}
export interface Finding {
    readonly start: FindingPosition;
    readonly end: FindingPosition;
    readonly message: string;
    readonly ruleName: string;
    readonly severity: Severity;
    readonly fix: Fix | undefined;
}
export declare const Finding: {
    compare(a: Finding, b: Finding): number;
};
export interface FindingPosition {
    readonly line: number;
    readonly character: number;
    readonly position: number;
}
export declare type Severity = 'error' | 'warning' | 'suggestion';
export interface RuleConstructor<T extends RuleContext = RuleContext> {
    readonly requiresTypeInformation: boolean;
    readonly deprecated?: boolean | string;
    supports?: RuleSupportsPredicate;
    new (context: T): AbstractRule;
}
export interface RuleSupportsContext {
    readonly program?: ts.Program;
    readonly settings: Settings;
    readonly options: {} | null | undefined;
}
export interface RuleContext {
    readonly program?: ts.Program;
    readonly sourceFile: ts.SourceFile;
    readonly settings: Settings;
    readonly options: {} | null | undefined;
    addFinding(start: number, end: number, message: string, fix?: Replacement | ReadonlyArray<Replacement>): void;
    getFlatAst(): ReadonlyArray<ts.Node>;
    getWrappedAst(): WrappedAst;
}
export interface TypedRuleContext extends RuleContext {
    readonly program: ts.Program;
}
export declare type Settings = ReadonlyMap<string, {} | null | undefined>;
export declare function predicate(check: RuleSupportsPredicate): (target: typeof AbstractRule) => void;
export declare function typescriptOnly(target: typeof AbstractRule): void;
export declare function excludeDeclarationFiles(target: typeof AbstractRule): void;
export declare function requireLibraryFile(fileName: string): (target: typeof TypedRule) => void;
export declare function requiresCompilerOption(option: BooleanCompilerOptions): (target: typeof TypedRule) => void;
export declare type RuleSupportsPredicate = (sourceFile: ts.SourceFile, context: RuleSupportsContext) => boolean | string;
export declare abstract class AbstractRule {
    readonly context: RuleContext;
    static readonly requiresTypeInformation: boolean;
    static deprecated: boolean | string;
    static supports?: RuleSupportsPredicate;
    static validateConfig?(config: any): string[] | string | undefined;
    readonly sourceFile: ts.SourceFile;
    readonly program: ts.Program | undefined;
    constructor(context: RuleContext);
    abstract apply(): void;
    addFinding(start: number, end: number, message: string, fix?: Replacement | ReadonlyArray<Replacement>): void;
    addFindingAtNode(node: ts.Node, message: string, fix?: Replacement | ReadonlyArray<Replacement>): void;
}
export declare abstract class ConfigurableRule<T> extends AbstractRule {
    options: T;
    constructor(context: RuleContext);
    protected abstract parseOptions(options: {} | null | undefined): T;
}
export declare abstract class TypedRule extends AbstractRule {
    static readonly requiresTypeInformation = true;
    readonly context: TypedRuleContext;
    readonly program: ts.Program;
    readonly checker: ts.TypeChecker;
    constructor(context: TypedRuleContext);
}
export declare abstract class ConfigurableTypedRule<T> extends TypedRule {
    options: T;
    constructor(context: TypedRuleContext);
    protected abstract parseOptions(options: {} | null | undefined): T;
}
export declare abstract class AbstractFormatter {
    prefix?: string;
    abstract format(filename: string, summary: FileSummary): string | undefined;
    flush?(): string | undefined;
}
export interface FormatterConstructor {
    new (): AbstractFormatter;
}
export interface Configuration {
    readonly aliases?: ReadonlyMap<string, Configuration.Alias>;
    readonly rules?: ReadonlyMap<string, Configuration.RuleConfig>;
    readonly settings?: Settings;
    readonly filename: string;
    readonly overrides?: ReadonlyArray<Configuration.Override>;
    readonly extends: ReadonlyArray<Configuration>;
    readonly rulesDirectories?: Configuration.RulesDirectoryMap;
    readonly processor?: string | null | false;
    readonly exclude?: ReadonlyArray<string>;
}
export declare namespace Configuration {
    type RulesDirectoryMap = ReadonlyMap<string, ReadonlyArray<string>>;
    type RuleSeverity = 'off' | 'warning' | 'error' | 'suggestion';
    interface RuleConfig {
        readonly severity?: RuleSeverity;
        readonly options?: any;
        readonly rulesDirectories: ReadonlyArray<string> | undefined;
        readonly rule: string;
    }
    interface Override {
        readonly rules?: ReadonlyMap<string, RuleConfig>;
        readonly settings?: ReadonlyMap<string, any>;
        readonly files: ReadonlyArray<string>;
        readonly processor?: string | null | false;
    }
    interface Alias {
        readonly rule: string;
        readonly options?: any;
        readonly rulesDirectories: ReadonlyArray<string> | undefined;
    }
}
export interface EffectiveConfiguration {
    rules: Map<string, EffectiveConfiguration.RuleConfig>;
    settings: Map<string, any>;
}
export declare namespace EffectiveConfiguration {
    interface RuleConfig {
        severity: Configuration.RuleSeverity;
        options: any;
        rulesDirectories: ReadonlyArray<string> | undefined;
        rule: string;
    }
}
export interface ReducedConfiguration extends EffectiveConfiguration {
    processor: string | undefined;
}
export interface ConfigurationProvider {
    find(fileToLint: string): string | undefined;
    resolve(name: string, basedir: string): string;
    load(fileName: string, context: LoadConfigurationContext): Configuration;
}
export declare abstract class ConfigurationProvider {
}
export interface LoadConfigurationContext {
    readonly stack: ReadonlyArray<string>;
    load(name: string): Configuration;
}
export declare enum Format {
    Yaml = "yaml",
    Json = "json",
    Json5 = "json5"
}
export interface ProcessorConstructor {
    getSuffixForFile(context: ProcessorSuffixContext): string;
    new (context: ProcessorContext): AbstractProcessor;
}
export interface ProcessorSuffixContext {
    fileName: string;
    getSettings(): Settings;
    readFile(): string;
}
export interface ProcessorContext {
    source: string;
    sourceFileName: string;
    targetFileName: string;
    settings: Settings;
}
export interface ProcessorUpdateResult {
    transformed: string;
    changeRange?: ts.TextChangeRange;
}
export declare abstract class AbstractProcessor {
    static getSuffixForFile(_context: ProcessorSuffixContext): string;
    protected source: string;
    protected sourceFileName: string;
    protected targetFileName: string;
    protected settings: Settings;
    constructor(context: ProcessorContext);
    abstract preprocess(): string;
    abstract postprocess(findings: ReadonlyArray<Finding>): ReadonlyArray<Finding>;
    abstract updateSource(newSource: string, changeRange: ts.TextChangeRange): ProcessorUpdateResult;
}
export interface MessageHandler {
    log(message: string): void;
    warn(message: string): void;
    error(e: Error): void;
}
export declare abstract class MessageHandler {
}
export interface DeprecationHandler {
    handle(target: DeprecationTarget, name: string, text?: string): void;
}
export declare abstract class DeprecationHandler {
}
export declare enum DeprecationTarget {
    Rule = "rule",
    Processor = "processor",
    Formatter = "formatter"
}
export interface FileSystem {
    normalizePath(path: string): string;
    readFile(file: string): string;
    readDirectory(dir: string): Array<string | Dirent>;
    stat(path: string): Stats;
    realpath?(path: string): string;
    writeFile(file: string, content: string): void;
    deleteFile(path: string): void;
    createDirectory(dir: string): void;
}
export declare abstract class FileSystem {
}
export interface Stats {
    isDirectory(): boolean;
    isFile(): boolean;
}
export interface Dirent extends Stats {
    name: string;
    isSymbolicLink(): boolean;
}
export interface RuleLoaderHost {
    loadCoreRule(name: string): RuleConstructor | undefined;
    loadCustomRule(name: string, directory: string): RuleConstructor | undefined;
}
export declare abstract class RuleLoaderHost {
}
export interface FormatterLoaderHost {
    loadCoreFormatter(name: string): FormatterConstructor | undefined;
    loadCustomFormatter(name: string, basedir: string): FormatterConstructor | undefined;
}
export declare abstract class FormatterLoaderHost {
}
export interface CacheFactory {
    create<K extends object, V = any>(weak: true): Cache<K, V>;
    create<K = any, V = any>(weak?: false): Cache<K, V>;
}
export declare abstract class CacheFactory {
}
export interface Cache<K, V> {
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    delete(key: K): void;
    has(key: K): boolean;
    clear(): void;
}
export interface Resolver {
    getDefaultExtensions(): ReadonlyArray<string>;
    resolve(id: string, basedir?: string, extensions?: ReadonlyArray<string>, paths?: ReadonlyArray<string>): string;
    require(id: string, options?: {
        cache?: boolean;
    }): any;
}
export declare abstract class Resolver {
}
export interface BuiltinResolver {
    resolveConfig(name: string): string;
    resolveRule(name: string): string;
    resolveFormatter(name: string): string;
}
export declare abstract class BuiltinResolver {
}
export interface DirectoryService {
    getCurrentDirectory(): string;
    getHomeDirectory?(): string;
}
export declare abstract class DirectoryService {
}
export interface FindingFilterFactory {
    create(context: FindingFilterContext): FindingFilter;
}
export declare abstract class FindingFilterFactory {
}
export interface FindingFilterContext {
    sourceFile: ts.SourceFile;
    ruleNames: ReadonlyArray<string>;
    getWrappedAst(): WrappedAst;
}
export interface FindingFilter {
    filter(finding: Finding): boolean;
    reportUseless(severity: Severity): ReadonlyArray<Finding>;
}
export interface LineSwitchParser {
    parse(context: LineSwitchParserContext): ReadonlyArray<RawLineSwitch>;
}
export declare abstract class LineSwitchParser {
}
export interface LineSwitchParserContext {
    sourceFile: ts.SourceFile;
    getCommentAtPosition(pos: number): ts.CommentRange | undefined;
}
export interface RawLineSwitch {
    readonly rules: ReadonlyArray<RawLineSwitchRule>;
    readonly enable: boolean;
    readonly pos: number;
    readonly end?: number;
    readonly location: Readonly<ts.TextRange>;
}
export interface RawLineSwitchRule {
    readonly predicate: string | RegExp | ((ruleName: string) => boolean);
    readonly location?: Readonly<ts.TextRange>;
    readonly fixLocation?: Readonly<ts.TextRange>;
}
export interface FileFilterContext {
    program: ts.Program;
    host: Required<Pick<ts.CompilerHost, 'readDirectory' | 'readFile' | 'useCaseSensitiveFileNames' | 'fileExists' | 'directoryExists'>>;
}
export interface FileFilterFactory {
    create(context: FileFilterContext): FileFilter;
}
export declare abstract class FileFilterFactory {
}
export interface FileFilter {
    filter(file: ts.SourceFile): boolean;
}
