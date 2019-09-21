class Regions::LocalAreasController < ApplicationController

  before_action :require_login!
  before_action :set_parents!, only: %i[new create]
  before_action :set_local_area!, only: %i[show edit update destroy]

  def show
    authorize @local_area
  end

  def new
    if @province
      @local_area = @province.local_areas.new
    elsif @country
      @local_area = @country.local_areas.new
    else
      @local_area = Regions::LocalArea.new
    end

    authorize @local_area
    @local_area.country_code = @country.country_code if @province
    setup_new_form!
  end

  def create
    @local_area = @province ? @province.local_areas.new(local_area_params) : @country.local_areas.new(local_area_params)
    authorize @local_area
    @local_area.country_code = @country.country_code if @province

    if @local_area.save
      redirect_to @local_area, flash: { success: 'Created local area' }
    else
      setup_new_form!
      render :new
    end
  end

  def edit
    authorize @local_area

    if @local_area.province_name?
      @title = "Edit Local Area within #{@local_area.province_name}, #{@local_area.country_code}"
    elsif @local_area.country_code?
      @title = "Edit Local Area within #{Regions::Country.get_name @local_area.country_code}"
    else
      @title = "Edit Custom International Area"
    end
  end

  def update
    authorize @local_area
    if @local_area.update local_area_params
      redirect_to @local_area, flash: { success: 'Saved local area' }
    else
      render :edit
    end
  end

  def destroy
    authorize @local_area
    flash[:success] = translate('messages.successfully_deleted_region', region: 'Local area')
    if @local_area.province.present?
      redirect_to @local_area.province
    elsif @local_area.country.present?
      redirect_to @local_area.country
    else
      redirect_to regions_countries_path
    end

    @local_area.destroy
  end

  private

    def setup_new_form!
      if @province
        @title = "Create Local Area within #{@province.province_name}, #{@province.country_code}"
        @url = regions_province_local_areas_path(@province, @local_area)
      elsif @country
        @title = "Create Local Area within #{@country.name}"
        @url = regions_country_local_areas_path(@country, @local_area)
      else
        @title = "Create Custom International Area"
        @url = regions_local_areas_path(@local_area)
      end
    end

    def set_parents!
      @country = Regions::Country.find(params[:country_id]) if params[:country_id]
      @province = Regions::Province.find(params[:province_id]) if params[:province_id]
      @country = @province.country if @province
    end

    def set_local_area!
      @local_area = Regions::LocalArea.find(params[:id])
    end

    def local_area_params
      params.fetch(:regions_local_area, {}).permit(
        :name, :identifier, :country_code, :province_name,
        :latitude, :longitude, :radius, :restriction
      )
    end

end