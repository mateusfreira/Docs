{"threeColumns": false}
# Use-cases

Appbase uses opensource Elasticsearch in the backend, and provides all the powerful search features of ES, on the data stored in Appbase.

When you want to make some data _searchable_, you have to enable search on a namespace in the _Dashboard_. In the _Data Browser_, enable the search by toggling the <i class="fa fa-eye-slash"></i> switch on the namespace. If search is enabled, you should see this icon <i class="fa fa-eye"></i> next to the namespace. 

Enabling search on a namespace causes all the vertices inside the namespace to be indexed inside Elasticsearch. New vertices created inside this namespace are automatically indexed, and searchable. When the data of a vertex is updated, the indices update automatically and new data is searchable.

## Elasticsearch Introduction

ElasticSearch is powered by Lucene, a powerful open-source full-text search library, under the hood. More than just full-text queries, ES can be used for numeric range queries, geo spatial queries, aggregation/ordering/grouping search results etc. In addition, we can combine these queries (logical and/or) and search across multiple namespaces and properties. To learn more about Elasticsearch, checkout [this very effective guide](http://exploringelasticsearch.com/).

## Data Mapping

As in Appbase has the concepts of Namespaces, Vertices and Properties, Elasticsearch has Types, Documents, and Fields. Let's see how Appbase data is indexed and how these concepts are mapped.

Purpose | Appbase | ES
--------|---------|----
Combining similar objects | Namespace | Type
JSON Data Containers | Vertex | Document 
JSON Object's Property | Property | Field


In a nutshell, All the _vertices_ of Appbase are stored as _documents_ inside ES, where the _namespace_ of the vertex becomes its _type_. _Properties_ of the vertex can be accessed and filtered as _fields_ inside ES. 

All the examples in this doc ES concepts (Type, Document and Field), as we will be making direct Elasticsearch DSL query, but the query is explained in context the of data in Appbase, so Appbase concepts (Namespace, Vertex and Property) are used.


## Request and Response Format

To do a raw ES query on the data, Appbase provides a [REST API endpoint]() and the Javascript library method [`Appbase.rawSearch()`](). Both of them, accepts similar request Query Object, and gives similar responses. 

### Request

A typical request object defines:

 - __namespaces__ - _array_ : The namespaces on which the query will run
 - __body__ - _object_ : The Elasticsearch Query DSL body

Elasticsearch provides rich Query DSL (Domain Specific Language) based on JSON to define queries. Queries involving major usecases are covered in this documentation, but if you want to know more about DSL, goto [this link](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl.html).

This is a sample request Query Object: 

```json
{
    "namespaces": ["user", "tweet"],
    "body": {
        "query": {
             "multi_match": {
                 "fields": ["msg", "name"],
                 "query": "hello"
             }
         }
     }
}
```

Do not worry about the `body` of this object for now, we will see how to define it for different use cases in this document.

### Response

We provide an unaltered DSL Response from ES. A typical response includes:

 - __took__ - _number_ : The time it took for the query to run
 - __timeout__ - _boolean_ : If the was query timed out
 - __\_shards__ -  _object_ : Sharding information
 - __hits__ - _object_ : Query results and more
	 - __total__ - _number_: Number of results
	 - __max_score__ - _number_ : The maximum _score_ that matched the query. This score comes into picture when we do a full text query.
	 - __hits__ - _array_ : The results that satisfied the query. Each object inside this array is a JSON object representing a _vertex_,  and has following perperties:
		 - __\_index__ - _string_ : Index inside which the object is stored. Appbase stores all the vertices of a single application inside a single index. So this will equal to the name of Appbase application you are using.
		 - __\_type__ - _string_ : Type of the document. I.E. namespace of the vertex (As explained in the Data Mapping).
		 - __\_id__ - _string_ : Id of the document inside ES.
		 - __\_score__ - _number_ : The score by witch the vertex matched the query
		 - __\_source__ - _object_ : The data inside the document (vertex).

> <sup>Elasticseach sidenote</sup>
> The _score_ of a result describes how close it matches the query.

Example: 

```json
{
	"took": 9,
	"timed_out": false,
	"_shards": {
		"total": 5,
		"successful": 5,
		"failed": 0
	},
	"hits": {
		"total": 2,
		"max_score": 6.41832,
		"hits": [
			{
				"_index": "twitter",
				"_type": "user",
				"_id": "53fa820a5f1f08c11ecb0f95",
				"_score": 6.41832,
				"_source": {
					"timestamp": 1408931734497,
					"rootPath": "user/hello",
					"_id": "53fa820a5f1f08c11ecb0f95",
					"name": "hello"
				}
			},
			{
				"_index": "twitter",
				"_type": "tweet",
				"_id": "546a504316453f340d289d97",
				"_score": 3.7718577,
				"_source": {
					"timestamp": 1416253508159,
					"rootPath": "tweet/244caea78e32401c9b16788219d8efd5",
					"_id": "546a504316453f340d289d97",
					"by": "sid",
					"msg": "hell"
				}
			}
		]
	}
}
```


## Searching

We see one by one, what queries apply in which search use cases, how you can combine them, and harness the full power that Elasticsearch provides. 

In each use case below, it is first described how the data is stored, and what kind of search we are trying to achieve on the data. Let's start with basic use case.

### Simple _Match_

This is the most basic use case we can think of, where you want to just find out vertices which contain a certain _term_, either as a string or a number. 

For example, _"give me all the.."_
	
 - users with first name "Andrew"
 - products priced at "$100"
 - tweets which say "hello"

We can use the _term filter_ or _term query_ for such cases.

> <sup>Elasticseach sidenote</sup>
> #### ___filter___ vs ___query___  
> A __filter__ in Elasticsearch says Yes or No for a document. I.E. If the document should be present in the results, or not. 
> A __query__ also _scores_ the document (counts the relevance with the desired search term - a heavy operation) and results come sorted according to their score.
> 
> Many filters and queries are similar and can be used interchangeably, but its preferred to use queries only for a full text search based on relevance.
> 
> They can be used together. I.E. Filters are applied first and then on those results, the query is performed calculating the score. They can also be wrapped inside each other. 

> Read more about them [here](http://exploringelasticsearch.com/searching_data.html#sec-searching-filtering).

For all the users with first name as "Andrew",

 - Using the _term __filter___, the request object would be: 

```json
{
    "namespaces": ["user"],
    "body": {
	    "filter" : {
            "term" : { "firstname" : "Andrew" }
        }
	}
}
```

- Using the _term __query___, the request object would be: 

```json
{
    "namespaces": ["user"],
    "body": {
	    "query" : {
            "term" : { "firstname" : "Andrew" }
        }
	}
}
```

 The _term_ filter can also be used for other datatypes, for e.g:

```json
{
    "namespaces": ["product"],
    "body": {
	    "filter" : {
            "term" : { "price" : 100 }
        }
	}
}
```

Another useful query is a _match query_. It allows to define a string of terms and it will find the documents which contains any of these terms. The more matching terms a vertex contains, the higher its score and higher it will be in the sorted results.

```json
{
    "namespaces": ["tweet"],
    "body": {
	    "query" : {
            "match" : { "message" : "hello world" }
        }
	}
}
```

The above search request would find tweets which contains terms "hello" or "world" or both. This behavior can be controlled with `operator`. Its value defaults to "or", but we can set to "and" as well. 

```json
{
    "namespaces": ["tweet"],
    "body": {
	    "query" : {
            "match" : {
	            "message" : {
		            "query" : "hello world",
		            "operator" : "and"
	            }
            }
        }
	}
}
```

The above search request would find tweets which contains terms "hello" and "world", both.

> <sup>Elasticseach sidenote</sup>
> #### ___match___ _query_ and ___terms___ _filter_
> The equivalent filter for a _match query_ is the _terms filter_.
> Read more about them: 
>  -  [_match query_ documentation](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-match-query.html)
>  -  [_terms filter_ documentation](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-terms-filter.html)


#### Searching on multiple properties

The _multi\_match_ query can search on multiple fields (properties) and returned if _any_ of those properties match _any_ of the terms.

The below query would search for users with either first name or last name, being "Andrew" or "Garlic". I.E. also the users with first name as "Garlic" would be included, and vice versa.

```json
{
    "namespaces": ["user"],
    "body": {
	    "query" : {
            "multi_match" : {
	            "query": "Andrew Garlic", 
			    "fields": ["firstname", "lastname"] 
            }
        }
	}
}
```

For more fine tuned searches, like on the users with first name as "Andrew" and last name as "Garlic", we have to combine queries/filters. We see that later in this document.

### Fuzzy

A fuzzy search matches with the documents who have the terms matching _nearly_  the search term.

This is very useful for Google-like searches, where there could be some typing mistakes, or the user is not sure what word exactly he is searching for. 

The simplest way to do a _fuzzy query_ is:

```json
{
    "namespaces": ["tweet"],
    "body": {
	    "query" : {
            "fuzzy" : { "message" : "hello" }
        }
	}
}
```

The above query would return tweets with the message as "hella" or "hallo" etc. 


> <sup>Elasticseach sidenote</sup>
> #### ___fuzzy___ search
> There are number of _fuzzy_ queries in Elasticsearch and a number of ways to control the _fuzziness_ of the term. Plus, you can search on a single or more properties (fields). Take a look at these documentations:
> - [_fuzzy_ query](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html)
> - [_fuzzy-like-this_ query](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-flt-query.html)
> - [_more-like-this_ query](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-mlt-query.html)

### Numeric-range

_"Give me all the..."_

- products priced at less than _$100_, more than _$50_ 
- pages between _5_ and _10_

We can use the _range filter_.
```json
{
    "namespaces": ["product"],
    "body": {
	    "filter" : {
            "range" : {
	            "price" : {
                    "lt": 100,
                    "gt": 50
                }
            }
        }
	}
}
```

> <sup>Elasticseach sidenote</sup>
> #### ___range___ _filter_
> It can also perform greater/less _or equal _ searches. See the [_range_ filter documentation](http://www.elasticsearch.org/guide/en/elasticsearch/reference/0.90/query-dsl-range-filter.html) for more details.

### Geo spatial

Elasticsearch requires you to store your the geographic location using longitude and latitude, stored as a nested JSON object. Lets say that we are storing restaurants, along with their location. The data of a restaurant would be: 
```json
{
	"name": "Sanro Vegetarian Restaurant",
	"location": {
		"lat" : 40.12
		"lon" : -71.34
	}
}
```

As long as the location is stored as above inside a vertex, we can do tons of geo spatial queries with Elasticsearch.

We can use _geo distance_ filter to find vertices located within specific distance from a geo point.

Find restaurants located within 5km from the point 40, -70.
```json
{
    "namespaces": ["restaurant"],
    "body": {
	    "filter" : {
            "geo_distance" : {
				"distance" : "5km",
				"location" : {
					"lat" : 40,
					"lon" : -70
				}
			}
		}
	}
}
```

> <sup>Elasticseach sidenote</sup>
> #### ___geo spatial___ _search_
> You can define the distance in real world Units like km, miles etc. There many ways the shape (box, polygon etc) and the range of this distance can be customized. Check out these documents for more details: 
> - [Elasticsearch Geo Location tutorial](http://www.elasticsearch.org/blog/geo-location-and-search/)
> - [_geo-distance_ filter](http://www.elasticsearch.org/guide/en/elasticsearch/reference/0.90/query-dsl-geo-distance-filter.html)
> - [_geo-distance-range_ filter](http://www.elasticsearch.org/guide/en/elasticsearch/reference/0.90/query-dsl-geo-distance-range-filter.html)
> - [_geo-bounding-box_ filter](http://www.elasticsearch.org/guide/en/elasticsearch/reference/0.90/query-dsl-geo-bounding-box-filter.html)
> - [_geo-polygon_ filter](http://www.elasticsearch.org/guide/en/elasticsearch/reference/0.90/query-dsl-geo-polygon-filter.html)
> - [_geo-shape_ filter](http://www.elasticsearch.org/guide/en/elasticsearch/reference/0.90/query-dsl-geo-shape-filter.html)
> - [_geohash-cell_ filter](http://www.elasticsearch.org/guide/en/elasticsearch/reference/0.90/query-dsl-geohash-cell-filter.html)

### Sorting

Results are sorted according to their _score_ by default. We can change this behavior by applying _sort_ parameter in the request.

Earlier in the _numeric range_ use case, we searched for products in price range $50 and $100. Let's sort the results according to their price, and then name.

```json
{
    "namespaces": ["product"],
    "body": {
	    "filter" : {
            "term" : { "price" : 100 }
        },
        "sort" : [
			{ "price" : "asc"},
			{ "name" : "asc" }
		],
	}
}
```
> <sup>Elasticseach sidenote</sup>
> #### ___sorting___
> You can specify the order of the sort (asc, desc), you can also sort on multi-valued fields. Geo Location based sort is possible too.
> Take a look at the [_sort_ documentation](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-request-sort.html).

### Aggregation

There are types of aggregation supported in Elasticsearch. 

 1. Grouping (Bucketing): vertices are grouped together based on criteria.
 2. Metric: keep track and compute metrics over a set of documents.

There wide varieties of aggregations and criteria, based on string-terms, locations, dates, numbers, etc. Take a look at the [_Aggregation API_ documentation](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-aggregations.html).

### Combining queries/filters

_"Give me all the products which.."_

 - are mobile phones
 _and_
 - are priced at lower than $800
 _and_
 - do not belong to the brand "Apple"
 _and_
 - are either 
	 - with brand "Samsung" _and_ "white" colored
	 _or_
	 - with brand "Sony" _and_ "black" colored
	_or_
	 - any brand with "metal" color

Writing these terms into a programming language like Javascript: 

```js
product.type == "mobile" &&
product.price < 800 &&
product.brand != "Apple" &&
(
	(product.brand == "Samsung" && product.color == "white") ||
	(product.brand == "Sony" && product.color == "white") ||
	product.color == "metal"
)
```

For such a case, Elasticsearch provides _bool query_ or _bool filter_. In a bool query/filter you define the the other kind of queries/filters which should or must be satisfied or, must not be satisfied.

A bool query/filter can have three kinds of clauses:

 - `must` - all the conditions (query/filter) defined inside this clause must appear in matching documents.
 - `must_not` - the conditions must not appear in the matching documents.
 - `should` - any one of the conditions must appear in the matching documents.

Lets write the request to search the mobile phones we described above.
```json
{
    "namespaces": ["product"],
    "body": {
	    "filter" : {
		    "bool": {
			    "must": [ 
				    {
					    "term": { "type": "mobile" }
				    }, 
				    {
					    "range": { "price": { "lt": 800 } }
				    }
			    ],
			    "must_not": [{
				    "term": { "brand": "Apple" }
			    }],
			    "should": [
				    {
					    "term": { "color": "metal"}
				    },
				    {
					    "bool": {
						    "must": [
							    {
								    "term": {"brand": "Samsung"}
							    },
							    {
								    "term": {"color": "white"}
							    }
						    ]
					    },
				    },
				    {
					    "bool": {
						    "must": [
							    {
								    "term": {"brand": "Sony"}
							    },
							    {
								    "term": {"color": "black"}
							    }
						    ]
					    }
				    }
			    ]
		    }
	    }
	}
}
```

> <sup>Elasticseach sidenote</sup>
> #### ___bool___ _query/filter_
> As you can see in the example here, we have using bool filters. This way you can write really complex search requests. To know more check out:
> - [_bool_ query documentation](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html)
> - [_bool_ filter documentation](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-bool-filter.html)


## Next steps

This document may only be able to give you a headstart on Elasticsearch, and it is impossible to cover every use case and feature provided by Elasticsearch. 

If you have confusions on any of the use cases covered here, see the additional notes and links provided beside them.

To understand the Elasticsearch from the basics to advanced level, the book ["Exploring Elasticsearch" by Andrew Cholakian](http://exploringelasticsearch.com/), and [Elasticsearch: The Definitive Guide](http://www.elasticsearch.org/guide/en/elasticsearch/guide/current/index.html) are definitely helpful.
