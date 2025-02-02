package io.openk9.entity.manager.logic;


import io.openk9.entity.manager.model.Entity;
import io.openk9.entity.manager.model.payload.EntityRequest;
import io.openk9.entity.manager.model.payload.RelationRequest;
import io.openk9.entity.manager.model.payload.Request;
import io.openk9.entity.manager.model.payload.Response;
import io.openk9.entity.manager.model.payload.ResponseList;
import io.openk9.http.util.HttpResponseWriter;
import io.openk9.http.web.Endpoint;
import io.openk9.http.web.HttpHandler;
import io.openk9.http.web.HttpRequest;
import io.openk9.http.web.HttpResponse;
import io.openk9.json.api.JsonFactory;
import io.openk9.relationship.graph.api.client.GraphClient;
import org.neo4j.cypherdsl.core.Cypher;
import org.neo4j.cypherdsl.core.Functions;
import org.neo4j.cypherdsl.core.Node;
import org.neo4j.cypherdsl.core.Statement;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.reactivestreams.Publisher;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.neo4j.cypherdsl.core.Cypher.literalOf;

@Component(
	immediate = true,
	service = Endpoint.class
)
public class GetOrAddEntitiesHttpHandler implements HttpHandler {

	@Override
	public String getPath() {
		return "/get-or-add-entities";
	}

	@Override
	public int method() {
		return POST;
	}

	@Override
	public Publisher<Void> apply(
		HttpRequest httpRequest, HttpResponse httpResponse) {

		Mono<Request> requestMono = Mono
			.from(httpRequest.aggregateBodyToString())
			.map(body -> _jsonFactory.fromJson(body, Request.class));

		Mono<ResponseList> response =
			requestMono
				.flatMapIterable(
					request -> request
						.getEntities()
						.stream()
						.map(entityRequest -> RequestContext
							.builder()
							.current(entityRequest)
							.content(request.getContent())
							.contentId(request.getContentId())
							.tenantId(request.getTenantId())
							.ingestionId(request.getIngestionId())
							.datasourceId(request.getDatasourceId())
							.rest(
								request
									.getEntities()
									.stream()
									.filter(er -> er != entityRequest)
									.collect(Collectors.toList())
							)
							.build()
						)
						.collect(Collectors.toList())
				)
				.flatMap(
					request -> Mono.<EntityContext>create(
						fluxSink -> {
							_startDisambiguation
								.disambiguate(request, fluxSink);
						}
					)
				)
				.collectList()
				.flatMap(entityContexts ->
					GetOrAddEntities.stopWatch(
						"write-relations", writeRelations(entityContexts)));

		return Mono
			.from(_httpResponseWriter.write(httpResponse, response));
	}

	public Mono<ResponseList> writeRelations(List<EntityContext> entityContext) {

		return Mono.defer(() -> {

			List<Statement> statementList = new ArrayList<>();

			for (EntityContext context : entityContext) {

				EntityRequest entityRequest = context.getEntityRequest();

				List<RelationRequest> relations =
					entityRequest.getRelations();

				if (relations == null || relations.isEmpty()) {
					continue;
				}

				Entity currentEntity = context.getEntity();

				List<Tuple2<String, Entity>> entityRelations =
					entityContext
						.stream()
						.flatMap(entry -> {

							for (RelationRequest relation : relations) {
								if (entry.getEntityRequest().getTmpId() == relation.getTo()) {
									return Stream.of(
										Tuples.of(
											relation.getName(),
											entry.getEntity())
									);
								}
							}

							return Stream.empty();

						})
						.collect(Collectors.toList());

				Node currentEntityNode =
					Cypher
						.node(currentEntity.getType())
						.named("a");

				List<Statement> currentStatementList =
					entityRelations
						.stream()
						.map(t2 -> {

							Entity entityRelation = t2.getT2();

							Node entityRelationNode =
								Cypher
									.node(entityRelation.getType())
									.named("b");

							return Cypher
								.match(currentEntityNode, entityRelationNode)
								.where(
									Functions
										.id(currentEntityNode)
										.eq(literalOf(currentEntity.getId()))
										.and(
											Functions
												.id(entityRelationNode)
												.eq(literalOf(
													entityRelation.getId()))
										)
								)
								.merge(
									currentEntityNode
										.relationshipTo(
											entityRelationNode, t2.getT1())
								)
								.build();
						})
						.collect(Collectors.toList());

				statementList.addAll(currentStatementList);

			}

			List<Response> response =
				entityContext
					.stream()
					.map(context -> Response
						.builder()
						.entity(
							Entity
								.builder()
								.name(context.getEntity().getName())
								.id(context.getEntity().getId())
								.tenantId(context.getEntity().getTenantId())
								.type(context.getEntity().getType())
								.build()
						)
						.tmpId(context.getEntityRequest().getTmpId())
						.build()
					)
					.collect(Collectors.toList());

			if (statementList.size() > 1) {
				return _graphClient
					.write(Cypher.unionAll(statementList.toArray(new Statement[0])))
					.then(Mono.just(ResponseList.of("", response)));
			}
			else if (statementList.size() == 1) {
				return _graphClient
					.write(statementList.get(0))
					.then(Mono.just(ResponseList.of("", response)));
			}
			else {
				return Mono.just(ResponseList.of("", response));
			}

		});

	}


	@Reference
	private GraphClient _graphClient;

	@Reference
	private JsonFactory _jsonFactory;

	@Reference
	private HttpResponseWriter _httpResponseWriter;

	@Reference
	private StartDisambiguation _startDisambiguation;

}
