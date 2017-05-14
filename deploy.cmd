@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off
dotnet restore deploy\Deploy.csproj
dotnet run --project deploy\Deploy.csproj