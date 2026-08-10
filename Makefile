clean:
	rm -rf ./dist
	rm -rf ./.nx/cache
	rm -rf ./node_modules

grpc-client-generate:
	protoc --plugin=node_modules/.bin/protoc-gen-ts_proto --experimental_allow_proto3_optional --ts_proto_out=. libs/contracts/src/**/*.proto --ts_proto_opt=outputEncodeMethods=false,outputJsonMethods=false,outputClientImpl=false,lowerCaseServiceMethods=true,returnObservable=true

infra:
	docker compose -f infrastructure/docker-compose.infrastructure.yml up
