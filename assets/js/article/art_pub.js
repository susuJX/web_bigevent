$(function() {
    var layer = layui.layer
    var form = layui.form

    initCate()
        // 初始化富文本编辑器
    initEditor()

    // 初始化分类列表
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章类别失败！')
                }
                var htmlStr = template('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)
                form.render()
            }
        })
    }

    // 1. 初始化图片裁剪器
    var $image = $('#image')
        // 2. 裁剪选项
    var options = {
            aspectRatio: 400 / 280,
            preview: '.img-preview'
        }
        // 3. 初始化裁剪区域
    $image.cropper(options)

    $('#chooseImage').on('click', function() {
        $('#coverFile').click()
    })

    // 监听 change 事件，拿到用户选择的文件
    $('#coverFile').on('change', function(e) {
        var file = e.target.files[0]
            //根据选择的文件，创建一个对应的 URL 地址
        var newImgURL = URL.createObjectURL(file)
            //先`销毁`旧的裁剪区域，再`重新设置图片路径`，之后再`创建新的裁剪区域`
        $image
            .cropper('destroy') // 销毁旧的裁剪区域
            .attr('src', newImgURL) // 重新设置图片路径
            .cropper(options) // 重新初始化裁剪区域
    })

    // 定义发布的默认状态
    var art_state = '已发布'

    $('#btnSave2').on('click', function() {
        art_state = '草稿'
    })

    $('#form-pub').on('submit', function(e) {
        e.preventDefault()
            // 基于form表单，快速创建一个 FormData 对象
        var fd = new FormData($(this)[0])
        fd.append('state', art_state)
            //将裁剪后的图片，输出为文件
        $image
            .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                width: 400,
                height: 280
            })
            .toBlob(function(blob) {
                // 将 Canvas 画布上的内容，转化为文件对象
                fd.append('cover_img', blob)
                publishArticle(fd)
            })
    })

    // 定义发布文章的方法
    function publishArticle(fd) {
        $.ajax({
            method: 'POST',
            url: '/my/article/add',
            data: fd,
            // 注意：如果向服务器提交的是FormData格式的数据，必须添加以下两个配置项
            contentType: false,
            processData: false,
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('发布文章失败！')
                }
                layer.msg('发布文章成功！')
                location.href = '/article/art_list.html'
            }
        })
    }
})