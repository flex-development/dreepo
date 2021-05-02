import merge from 'lodash.merge'
import mingo from 'mingo'
import type { OperatorMap } from 'mingo/core'
import { OperatorType, useOperators } from 'mingo/core'
import * as AccumulatorOperators from 'mingo/operators/accumulator'
import * as ArithmeticOperators from 'mingo/operators/expression/arithmetic'
import * as ArrayOperators from 'mingo/operators/expression/array'
import * as BooleanOperators from 'mingo/operators/expression/boolean'
import * as ComparisonOperators from 'mingo/operators/expression/comparison'
import * as ConditionalOperators from 'mingo/operators/expression/conditional'
import { $dateFromString, $dateToString } from 'mingo/operators/expression/date'
import * as LiteralOperators from 'mingo/operators/expression/literal'
import * as ObjectOperators from 'mingo/operators/expression/object'
import * as SetOperators from 'mingo/operators/expression/set'
import {
  $concat,
  $split,
  $strcasecmp,
  $strLenCP,
  $toLower,
  $toUpper,
  $trim
} from 'mingo/operators/expression/string'
import { $convert } from 'mingo/operators/expression/type'
import * as VariableOperators from 'mingo/operators/expression/variable'
import {
  $addFields,
  $bucket,
  $bucketAuto,
  $count,
  $facet,
  $group,
  $limit,
  $match,
  $project,
  $redact,
  $replaceRoot,
  $replaceWith,
  $sample,
  $skip,
  $sort,
  $sortByCount,
  $unset,
  $unwind
} from 'mingo/operators/pipeline'
import * as ProjectionOperators from 'mingo/operators/projection'
import * as QueryOperators from 'mingo/operators/query'

/**
 * @file Config - Mingo
 * @module config/mingo
 * @see https://github.com/kofrasa/mingo#configuration
 */

const DateOperators = { $dateFromString, $dateToString }
const StringOperators = {
  $concat,
  $split,
  $strLenCP,
  $strcasecmp,
  $toLower,
  $toUpper,
  $trim
}
const TypeOperators = { $convert }

const ExpressionOperators = merge(
  {},
  ArithmeticOperators,
  ArrayOperators,
  BooleanOperators,
  ComparisonOperators,
  ConditionalOperators,
  DateOperators,
  LiteralOperators,
  ObjectOperators,
  SetOperators,
  StringOperators,
  TypeOperators,
  VariableOperators
)

const PipelineOperators = {
  $addFields,
  $bucket,
  $bucketAuto,
  $count,
  $facet,
  $group,
  $limit,
  $match,
  $project,
  $redact,
  $replaceRoot,
  $replaceWith,
  $sample,
  $skip,
  $sort,
  $sortByCount,
  $unset,
  $unwind
}

/**
 * Enables operators the {@module repositories/RTD} uses.
 * If other operators are needed, they must be enabled by the user.
 *
 * @return {void}
 */
const enableOperators = (): void => {
  useOperators(OperatorType.ACCUMULATOR, AccumulatorOperators as OperatorMap)
  useOperators(OperatorType.EXPRESSION, ExpressionOperators as OperatorMap)
  useOperators(OperatorType.PIPELINE, PipelineOperators as OperatorMap)
  useOperators(OperatorType.PROJECTION, ProjectionOperators as OperatorMap)
  useOperators(OperatorType.QUERY, QueryOperators as OperatorMap)
}

// Enable Repository operators
enableOperators()

export default mingo
